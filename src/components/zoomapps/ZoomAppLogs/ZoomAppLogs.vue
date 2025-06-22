<script setup lang="ts">
import { DateTime } from 'luxon';
import type { InformationLog } from '../helpers/InformationLog';
import type { ActionLog } from '../helpers/ActionLog';
import type { ClassStatus } from '../helpers/ClassConfig';

const props = defineProps<{
  informationLogs: InformationLog[],
  actionLogs: ActionLog[],
  timezone: string,
  classStatus: ClassStatus[],
}>();

async function wrapActionLogsAction(actionLog: ActionLog, index: number): Promise<void> {
  await actionLog.action().then(null, rej => addError(JSON.stringify(rej)));
  props.actionLogs.splice(index, 1);
  props.informationLogs.unshift({
    class: actionLog.class,
    message: actionLog.message,
    timestamp: DateTime.now(),
  });
}

function addError(message: string): void {
  props.informationLogs.unshift({
    class: 'error',
    message: message,
    timestamp: DateTime.now(),
  });
}

function clearInformationLogs(): void {
  props.informationLogs.splice(0);
}
function clearActionlogs(): void {
  props.actionLogs.splice(0);
}

function displayDateTime(datetime: DateTime): string {
  const dateFormat = 'MM-dd HH:mm:ss';
  return datetime.setZone(props.timezone).toFormat(dateFormat);
}

</script>

<template>
  <div class="container">
    <div>
      <h2>Information logs</h2>
      <button @click="clearInformationLogs()">Clear information logs</button>
      <br />
      <li v-for="pc in informationLogs" :class="[pc.class]">
        <label class="date">{{ displayDateTime(pc.timestamp) }}:</label>{{ pc.message }}
      </li>
    </div>
    <div>
      <h2>Action logs (double click to action)</h2>
      <button @click="clearActionlogs()">Clear action logs</button>
      <br />
      <li v-for="(pc, index) in actionLogs" :class="[pc.class]" @dblclick="wrapActionLogsAction(pc, index)">
        <label class="date">{{ displayDateTime(pc.timestamp) }}:</label>{{ pc.message }}
      </li>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
}

.container>div {
  flex-grow: 1;
  flex-basis: 0;
}

.date {
  font-weight: bold;
  margin-right: 10px;
}

/* Log colors */

.error {
  background-color: var(--secondary-color);
}

.join {
  background-color: var(--tertiary-color);
}

.leave {
  background-color: var(--primary-color);
}
</style>