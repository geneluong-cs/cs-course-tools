<script lang="ts" setup>
import zoomSdk, { type OnParticipantChangeParticipantType, type Participant } from '@zoom/appssdk';
import { computed, ref, watch, type ComputedRef } from 'vue';
import { getRouteName } from '@/router/RouterNames';
import type { InformationLog } from './helpers/InformationLog';
import type { ActionLog } from './helpers/ActionLog';
import { DateTime } from 'luxon';
import { Groups, type ClassConfig, type ClassStatus } from './helpers/ClassConfig';
import { parseConfig, validateClassConfig } from './helpers/ConfigParser';
import { groupBy } from '@/utils/array-utils';

const errors = ref(new Array<string>());
const informationLogs = ref(new Array<InformationLog>());
const actionLogs = ref(new Array<ActionLog>());
const defaultTimezone = DateTime.now().zoneName;
const timezone = ref(defaultTimezone);
const classListConfigRaw = ref('');
const classStatus = ref(new Array<ClassStatus>());
const showConfigs = ref(true);

const classConfig: ComputedRef<ClassConfig[]> = computed(() => {
  const [log, res] = parseConfig(classListConfigRaw.value);
  if (log !== undefined) {
    addError(log);
  }
  const errors = validateClassConfig(res);
  if (errors.length > 0) {
    errors.forEach(addError);
    return [];
  } else {
    return res;
  }
});

watch(classConfig, async (newConfig) => {
  classStatus.value = await calculateClassStatus(newConfig);
});

async function resyncClassStatus() {
  classStatus.value = await calculateClassStatus(classConfig.value);
}

async function calculateClassStatus(classConfig: ClassConfig[]): Promise<ClassStatus[]> {
  if (classConfig.length === 0) {
    return [];
  }

  const response = await zoomSdk.getMeetingParticipants();

  const meetingParticipantLookup = new Map(response.participants.map(p => [p.screenName, p.participantUUID]));

  if (meetingParticipantLookup.size != response.participants.length) {
    const grouped = groupBy(response.participants, 'screenName');

    const groupedKeys = Object.keys(grouped);
    const duplicatedScreenNames = groupedKeys.filter(x => (grouped[x] as Participant[]).length > 1);

    duplicatedScreenNames.forEach(x => addError(`Duplicate screen name found '${x}'. Tracking may not work properly`));
  }

  const results = [];
  for (const cc of classConfig) {
    const foundInMeeting = [cc.finalName, ...cc.potentialNames].filter(n => meetingParticipantLookup.has(n));
    const res: ClassStatus = {
      finalName: cc.finalName,
      id: cc.id,
      potentialNames: cc.potentialNames,
      group: cc.group,
      here: foundInMeeting.length > 0,
      participantUuid: foundInMeeting.length > 0 ? meetingParticipantLookup.get(foundInMeeting[0] as string) : undefined,
    };

    if (foundInMeeting.length > 1) {
      addError(`Config id '${cc.id}' has multiple names found in the meeting (${foundInMeeting.join(', ')}). Tracking may not work properly'`)
    }
    if (foundInMeeting.length > 0) {
      for (const screenName of foundInMeeting) {
        if (screenName !== cc.finalName) {
          // scoping issues with the lookup inside in the action
          const uuid = meetingParticipantLookup.get(screenName) as string;
          actionLogs.value.unshift({
            class: '',
            message: `Rename '${screenName}'' to '${cc.finalName}'`,
            action: () => zoomSdk.setParticipantScreenName({
              participantUUID: uuid,
              screenName: cc.finalName
            }),
            timestamp: DateTime.now(),
          });
        }
      }

      foundInMeeting.forEach(x => meetingParticipantLookup.delete(x));
    }
    results.push(res);
  };

  const unknownsInMeeting = Array.from(meetingParticipantLookup).map(x => {
    const res: ClassStatus = {
      finalName: x[0],
      id: x[1],
      potentialNames: [],
      group: Groups.Unknown,
      here: true,
      participantUuid: x[1],
    };
    return res;
  });

  return [...results, ...unknownsInMeeting];
}

function updateClassStatus(x: OnParticipantChangeParticipantType): void {
  for (const status of classStatus.value) {
    if (status.finalName === x.screenName
      || status.potentialNames.some(pot => pot === x.screenName)
      || status.participantUuid === x.participantUUID) { // Got renamed during the meeting
      status.here = x.status == 'join';
      status.participantUuid = x.status === 'join' ? x.participantUUID : undefined;
      return;
    }
  }

  addError(`Unknown user ${x.screenName} ${x.status} the meeting`);
  if (x.status === 'join') {
    classStatus.value.push({
      id: x.screenName,
      finalName: x.screenName,
      potentialNames: [],
      group: Groups.Unknown,
      here: true,
      participantUuid: x.participantUUID,
    });
  }
}

function addError(message: string): void {
  informationLogs.value.unshift({
    class: 'error',
    message: message,
    timestamp: DateTime.now(),
  });
}

async function init(): Promise<any> {

  const conf = await zoomSdk.config({
    capabilities: [
      'assignParticipantToBreakoutRoom',
      'configureBreakoutRooms',
      'connect',
      'createBreakoutRooms',
      'getBreakoutRoomList',
      'getMeetingParticipants',
      'getMeetingUUID',
      'getRunningContext',
      'getUserContext',
      'onConnect',
      'onMeeting',
      'onMessage',
      'onParticipantChange',
      'onReaction',
      'openBreakoutRooms',
      'postMessage',
      'renameBreakoutRoom',
      'setParticipantScreenName',
    ],
  });

  await zoomSdk.connect();

  zoomSdk.onParticipantChange(event => {
    const time = DateTime.fromSeconds(event.timestamp);
    // Add information log
    informationLogs.value.unshift(...event.participants.map((x) => {
      return {
        timestamp: time,
        class: x.status,
        message: `${x.screenName} has ${x.status}`
      } as InformationLog;
    }));

    // Add action log
    for (const x of event.participants) {
      if (x.status === 'leave') {
        continue;
      }

      if (x.role === 'host') {
        actionLogs.value.unshift({
          class: x.status,
          message: `${x.screenName} (aka ${x.role}) has joined - do they need to rename themselves?`,
          timestamp: time,
          action: () => Promise.resolve(null)
        });
        continue;
      }

      for (const rc of classConfig.value) {
        for (const potentialJoinName of rc.potentialNames) {
          if (potentialJoinName === x.screenName) {

            actionLogs.value.unshift({
              class: '',
              message: `Rename '${x.screenName}'' to '${rc.finalName}'`,
              action: () => zoomSdk.setParticipantScreenName({
                participantUUID: x.participantUUID,
                screenName: rc.finalName
              }),
              timestamp: time,
            });
            break;
          }
        }
      }
    }

    for (const x of event.participants) {
      updateClassStatus(x);
    }
  });

  // TODO: detect when someone has been renamed and whether or not we need to update the class list
}

await init().catch(error => errors.value.push(error));

</script>

<template>
  <div v-if="errors.length > 0">
    <li v-for="error in errors">
      {{ error }}
    </li>
  </div>
  <div v-else>
    <header>
      <nav>
        <RouterLink v-bind:to="getRouteName('zoom-apps-logs')">Logs</RouterLink>
        <RouterLink v-bind:to="getRouteName('zoom-apps-report-status')">Report - Status</RouterLink>
        <RouterLink v-bind:to="getRouteName('zoom-apps-random-breakout-room-management')">Random BOR management
        </RouterLink>
        <RouterLink v-bind:to="getRouteName('zoom-apps-group-breakout-room-management')">Group BOR management
        </RouterLink>
      </nav>
    </header>
    <div>
      <div class="config-container">
        <h1>Additional options</h1>
        <button @click="resyncClassStatus()">Re-sync class status</button>
        <br />
        <button v-if="showConfigs === false" @click="showConfigs = true">Show configs</button>
      </div>
      <div class="config-container" v-if="showConfigs">
        <h1>Config</h1>
        <textarea class="config" v-model="classListConfigRaw"></textarea>
        <div>IANA Timezone</div>
        <select v-model="timezone">
          <option v-for="tz of Intl.supportedValuesOf('timeZone')" :value="tz">{{ tz }}</option>
        </select>
        <br />
        <button @click="showConfigs = false">Hide config</button>
      </div>
      <RouterView :informationLogs="informationLogs" :actionLogs="actionLogs" :timezone="timezone"
        :classStatus="classStatus" />
    </div>
  </div>
</template>

<style scoped>
.config-container {
  margin-bottom: 20px;
}

.config {
  min-height: 300px;
  width: 100%;
}
</style>