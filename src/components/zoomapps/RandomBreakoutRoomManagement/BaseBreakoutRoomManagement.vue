<script setup lang="ts">
import { ref, type Ref } from 'vue';
import zoomSdk, { type BreakoutRoomsResponse } from '@zoom/appssdk'
import { getGroupNumber, getNewRoomName, identifyAccountability } from '../helpers/NamingConventions';
import { createLog, type LogType, type RichLog } from './TraceLogs';
import { evenOutBreakoutRooms, type BreakoutRoomResolution } from '../helpers/BreakoutRoomHelpers';
import { groupBy, groupByFunc } from '@/utils/array-utils';
import { forumBreakoutTimes, translateConfigToNotifyTimings, type BreakoutRoomConfig } from '../helpers/BreakoutRoomTimes';
import { Groups, type ClassStatus } from '../helpers/ClassConfig';

const props = defineProps<{
  timezone: string,
  classStatus: ClassStatus[],
  mode: 'group' | 'random',
}>();

const magicDelay = ref(500); // 400 seems to be okay, but setting it higher just in case

const logs: Ref<RichLog[]> = ref([]);
const timeSignals = ref(new Array<string>());
const errors = ref(new Array<string>());

function addLog(msg: any, logType: LogType = 'INFO') {
  logs.value.unshift(createLog(msg, logType));
}

function clearLogs() {
  logs.value = [];
}

function addDebugLog(obj: any) {
  addLog(obj, 'DEBUG')
}

function addErrorLog(err: any) {
  addLog(err, 'ERROR');
}

function updateTimeSignals() {
  timeSignals.value = translateConfigToNotifyTimings(config.value);
}

function createRandomBreakoutRooms() {
  return zoomSdk.getMeetingParticipants().then(res => {
    const totalParticipants = res.participants.length;

    const approxRooms = Math.ceil(totalParticipants / config.value.peoplePerRoom)
    const adjustedRoomsRequired = Math.min(100, approxRooms);
    addLog(`Creating ${adjustedRoomsRequired} rooms`);
    addDebugLog(`Total participants ${totalParticipants}, approx rooms ${approxRooms}`);

    if (adjustedRoomsRequired != approxRooms) {
      addLog('There may not be enough rooms to fit the current setting', 'WARNING');
    }
    return zoomSdk.createBreakoutRooms({
      assign: 'automatically',
      numberOfRooms: adjustedRoomsRequired,
    });

  }, addErrorLog)
    .then(res => configureBreakoutRooms(), addErrorLog)
}

function createGroupBreakoutRooms() {
  const participants = props.classStatus.filter(x => x.group === Groups.Participant && x.here);
  const groupToUser = groupByFunc(
    participants,
    x => getGroupNumber(x.finalName).toString(),
    x => x.participantUuid
  );

  participants.filter(x => isNaN(getGroupNumber(x.finalName))).forEach(x => addErrorLog(`Unable to determine the group number for '${x.finalName}'`));

  const maxGroup = Object.keys(groupToUser).map(x => parseInt(x)).filter(x => !isNaN(x)).reduce((l, r) => Math.max(l, r), 0);
  const groupWithBuffers = maxGroup + 6; // 5 spares and the leader room
  const adjustedRoomsRequired = Math.min(100, groupWithBuffers);
  addLog(`Creating ${adjustedRoomsRequired} rooms`);
  addDebugLog(`Group numbers found ${maxGroup}, including buffers ${groupWithBuffers} will be created`);

  if (adjustedRoomsRequired != groupWithBuffers) {
    addLog('There may not be enough rooms to fit the current setting', 'WARNING');
  }

  return zoomSdk.createBreakoutRooms({
    assign: 'manually',
    numberOfRooms: adjustedRoomsRequired,
    names: Array(adjustedRoomsRequired).fill(0).map((x, i) => getNewRoomName(i)),
  }).then(x => configureBreakoutRooms(), addErrorLog)
    .then(x => {
      return zoomSdk.getBreakoutRoomList().then(res => {
        return Promise.all(res.rooms.flatMap((x, i) => {
          const users = groupToUser[i.toString()];
          if (users === undefined) {
            return [];
          } else {
            // Could potentially be in an error state where the Uuid isn't defined and the participant is here
            return users.filter(x => x !== undefined).map(p => zoomSdk.assignParticipantToBreakoutRoom({
              uuid: x.breakoutRoomId,
              participantUUID: p,
            }));
          }
        }));
      }, addErrorLog)
    }, addErrorLog);
}

function configureBreakoutRooms(): Promise<any> {
  return zoomSdk.configureBreakoutRooms({
    allowParticipantsChooseRoom: false,
    allowParticipantsReturnToMainSession: true,
    automaticallyMoveParticipantsIntoRooms: true,
    automaticallyMoveParticipantsIntoMainRoom: true,
    closeAfter: config.value.totalTotalTime,
    countDown: 0,
  });
}

function removeAssistingTeam(applyChanges: boolean) {
  return zoomSdk.getBreakoutRoomList().then(res => {
    return Promise.all(res.rooms.flatMap((el, index) => {
      const assisting = el.participants?.filter(x => identifyAccountability(x.displayName) == 'pwa');
      if (assisting && assisting.length > 0) {
        addLog(`Removing '${assisting.map(x => x.displayName).join(', ')}' from room '${el.name}' because they are assisting`);
        return applyChanges ? assisting.map(participant => zoomSdk.assignParticipantToBreakoutRoom({
          uuid: undefined, // Main room
          participantUUID: participant.participantUUID,
        })) : [];
      } else {
        addLog(`No assisting team identified in room ${el.name}`);
        return [];
      }
    })).then(_ => addLog('Removed assisting team'), addErrorLog);
  }, addErrorLog);
}

function balanceTheRooms(roomTarget: number, applyChanges: boolean) {
  return zoomSdk.getBreakoutRoomList().then(res => {
    const changes = evenOutBreakoutRooms(res, roomTarget);
    return applyBreakoutRoomChanges(changes, res, applyChanges);
  }, addErrorLog).then(x => addLog('Room balancing complete'), addErrorLog);
}

function applyBreakoutRoomChanges(changes: BreakoutRoomResolution[], breakoutRoomResponses: BreakoutRoomsResponse, applyChanges: boolean): Promise<any> {
  const adding = changes.filter(x => x.action == 'Add');
  const newRoom = changes.filter(x => x.action == 'ExtraRoom');
  const underAllocated = changes.filter(x => x.action == 'UnderAllocated');

  underAllocated.forEach(x => {
    const displayName = breakoutRoomResponses.rooms.find(y => y.breakoutRoomId == x.borid)?.name || x.borid;
    addLog(`Room '${displayName}' is underallocated`, 'WARNING')
  });
  const participantMap = new Map(
    breakoutRoomResponses.rooms.flatMap(x =>
      (x.participants || []).map(p =>
        [p.participantUUID, [p.displayName, x.name]])));
  for (const change of [...newRoom, ...adding]) {
    const borName = breakoutRoomResponses.rooms.find(y => y.breakoutRoomId == change.borid)?.name || change.borid;
    const participantInfo = change.participantUuid ? participantMap.get(change.participantUuid) : ['<no participant>', '<no room>'];
    addLog(`Participant ${participantInfo?.[0]} will be ${change.action} from ${participantInfo?.[1]} to room ${borName}`);
  }

  const roomsToCreate = groupBy(newRoom, 'borid');
  const keys = Object.keys(roomsToCreate);
  const newRoomPromises = applyChanges ? keys.map(key =>
    zoomSdk.addBreakoutRoom({
      name: `New Room ${key}`
    }).then(uuid => {
      return Promise.all(
        roomsToCreate[key].map(f => zoomSdk.assignParticipantToBreakoutRoom({
          participantUUID: f.participantUuid,
          uuid: uuid.uuid
        }))
      )
    }, addErrorLog)
  ) : [Promise.resolve()];

  return Promise.all([
    ...adding.map(x => applyChanges ? zoomSdk.assignParticipantToBreakoutRoom({
      participantUUID: x.participantUuid,
      uuid: x.borid
    }) : [Promise.resolve()]),
    ...newRoomPromises
  ]);
}

async function showRoomState() {
  const res = await zoomSdk.getBreakoutRoomList();
  addLog('Breakout rooms are ' + res.state);
  const a = res.rooms.map(bor => `\nRoom '${bor.name}':\n\t` + (bor.participants || []).map(x => `${x.displayName}:${x.participantUUID}`).join('\n\t')).join('\n');
  addLog(a);
}

async function recreateBreakoutRooms() {
  errors.value.splice(0);
  timeSignals.value.splice(0);

  if (config.value.peopleSharing > config.value.peoplePerRoom) {
    errors.value.push('People sharing is not <= people per room');
  }

  if (config.value.totalTotalTime < (config.value.peopleSharing * config.value.timePerShare)) {
    errors.value.push('total time needs to be < people sharing * time per share');
  }

  if (config.value.notifyAt > config.value.timePerShare) {
    errors.value.push('Notify at must be < time per share');
  }

  if (errors.value.length > 0) {
    return;
  }

  updateTimeSignals();

  switch (props.mode) {
    case 'random':
      await createRandomBreakoutRooms()
        .then(res => removeAssistingTeam(true), addErrorLog)
        .then(res => balanceTheRooms(config.value.peoplePerRoom, true), addErrorLog);
      return;
    case 'group':
      await createGroupBreakoutRooms();
      return;
    default:
      addErrorLog('Unkown mode specified. Contact the developer');
      return;
  }
}

function setConfig(conf: BreakoutRoomConfig) {
  config.value = conf;
}

const defaultConfig: BreakoutRoomConfig = {
  page: 0,
  description: "Not editable",
  peoplePerRoom: 6,
  peopleSharing: 3,
  totalTotalTime: 10,
  timePerShare: 3,
  notifyAt: 2.5,
};
const config: Ref<BreakoutRoomConfig> = ref(defaultConfig);
updateTimeSignals();

const presetConfig = new Map(Object.keys(forumBreakoutTimes).flatMap(k => forumBreakoutTimes[k].map(conf => [`${k} page ${conf.page}`, conf])));
</script>

<template>
  <h1>Breakout Room Management</h1>

  <h2>Presets</h2>
  <button v-for="[key, conf] of presetConfig" @click="setConfig(conf)">{{ key }}</button>


  <h2>Configuration</h2>
  <div class="form">
    <label>
      Page Reference in manual {{ config.page }}
    </label>
    <br />
    <label>
      Description
      {{ config.description }}
    </label>
    <br />
    <div>
      Example: We will put you into breakout rooms in groups of {{ defaultConfig.peoplePerRoom }} (people per room), {{
        defaultConfig.peopleSharing }} (people sharing) will be sharing for {{ defaultConfig.timePerShare }} mins (time
      per share), at {{ defaultConfig.notifyAt }} mins (notify at time)
      you will see a pop up that says ....
      <br />
      Production note: close the room at {{ defaultConfig.totalTotalTime }} mins (Total time)
    </div>
    <div>
      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
      </p>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
    </div>
    <label>
      <input type="number" v-model.number="config.peoplePerRoom" />
      People per room
    </label>
    <br />
    <label>
      <input type="number" v-model.number="config.peopleSharing" />
      People sharing (Needs to be &le; people per room)
    </label>
    <br />
    <label>
      <input type="number" v-model.number="config.totalTotalTime" />
      Total time, this is the time to set in zoom (this needs to be &ge; people per room * time per share)
    </label>
    <br />
    <label>
      <input type="number" v-model.number="config.timePerShare" />
      Time per share
    </label>
    <br />
    <label>
      <input type="number" v-model.number="config.notifyAt" />
      Notify at time, this is the time to broadcast (Needs to be &lt; time per share)
    </label>
    <br />
    <br />
    <button @click="updateTimeSignals()">Update time signals</button>
    <br />
    <br />
    <button @click="recreateBreakoutRooms()">Recreate breakout rooms</button>
    <br />
    <br />
    <button @click="showRoomState()">Show room state</button>
    <button @click="clearLogs()">Clear logs</button>
  </div>

  <h2>Time signals</h2>
  <p>When the breakout room countdown timer reaches here, send out a broadcast</p>
  <div v-if="timeSignals.length > 0">
    <ul>
      <li v-for="t of timeSignals">{{ t }}</li>
    </ul>
  </div>
  <div v-else>
    No time signals
  </div>

  <h2>Logs</h2>
  <div>
    <ul>
      <li v-for="l of logs" :class="[l.logType.toLocaleLowerCase()]">
        <pre>{{ l.time.toFormat('yyyy-MM-dd HH:mm:ss') }}: {{ l.msg }}</pre>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.debug {
  background-color: lightcoral;
}

.info {
  background-color: blue;
}

.warning {
  background-color: gray;
}

.error {
  background-color: red;
}
</style>