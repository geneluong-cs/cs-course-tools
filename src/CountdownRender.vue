<script setup lang="ts">
import { DateTime, Duration } from 'luxon';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

const errors = new Array<string>();
const route = useRoute();

const messages = new Array<string>();
let numHours = 0;
let numMinutes = 0;
const timeZones = new Array<string>();
let numJitter = 0;

const countdownDuration = ref<Duration<boolean>>(Duration.fromObject({}));
const timeLeft = computed(() => countdownDuration.value.toFormat('hh:mm:ss'));

const messageData = route.query['message'];
const timezoneData = route.query['timezone'];
const hoursData = route.query['hours'];
const minuteData = route.query['minutes'];
const jitterData = route.query['jitter'];

if (typeof (messageData) === 'string') {
  messages.push(messageData);
} else if (Array.isArray(messageData)) {
  messages.push(...messageData as string[]);
} else {
  errors.push('No messages found');
}

const numReg = /^\d+$/;
const anyNumReg = /^-?\d+$/;

if (typeof (hoursData) === 'string') {
  if (numReg.test(hoursData)) {
    numHours = parseInt(hoursData);

    if (numHours < 0 || numHours > 23) {
      errors.push('Number of hours need to be within 0 <= hours < 23')
    }
  } else {
    errors.push('hours value must be numerical');
  }
}

if (typeof (minuteData) === 'string') {
  if (numReg.test(minuteData)) {
    numMinutes = parseInt(minuteData);

    if (numMinutes < 0 || numMinutes > 59) {
      errors.push('Number of mintues need to be within 0 <= minutes < 59')
    }
  } else {
    errors.push('minute value must be numerical');
  }
}

if (typeof (timezoneData) === 'string') {
  timeZones.push(timezoneData);
} else if (Array.isArray(timezoneData)) {
  timeZones.push(...timezoneData as string[]);
} else {
  timeZones.push(DateTime.now().zoneName);
}

if (typeof (jitterData) === 'string') {
  if (anyNumReg.test(jitterData)) {
    numJitter = parseInt(jitterData);
  } else {
    errors.push('jitter value must be numerical');
  }
}

const start = DateTime.now().setZone(timeZones[0]);

const targetDate = start.set({
  hour: numHours,
  minute: numMinutes,
  second: 0,
  millisecond: 0,
}).plus({ day: numHours < start.hour ? 1 : 0 });

const targetDateAdjusted = targetDate.plus({ millisecond: numJitter });

function updateCountdown(): void {
  const now = DateTime.local().setZone(timeZones[0]);
  const diff = targetDateAdjusted.diff(now);
  countdownDuration.value = diff;

  if (diff.milliseconds < 0) {
    clearInterval(countdownInterval);
  }
}

const countdownInterval = setInterval(updateCountdown, 1000);

</script>

<template>
  <template v-if="errors.length > 0">
    <div v-for="e of errors">{{ e }}</div>
  </template>
  <div class="container" v-else>
    <div class="message-container">
      <div class="message" v-for="m of messages">
        {{ m }}
      </div>
    </div>
    <div class="time-zones">
      <div v-for="tz of timeZones">
        <div>{{ tz }}</div>
        <div>{{ targetDate.setZone(tz).toFormat('HH:mm:ss') }}</div>
      </div>
    </div>
    <div class="timer" v-if="countdownDuration.milliseconds > 0">{{ timeLeft }}</div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;

  display: grid;
  grid-template-rows: 80% 10% 10%;

  text-align: center;
}

.message-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.message {
  font-size: 4em;
  border: 2px solid black;
  padding: 20px;

  flex-grow: 1;

  white-space: pre-wrap;
}

.time-zones {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  font-size: 2em;

  border-bottom: 2px solid black;
}

.timer {
  font-weight: bold;
  font-size: 6em;
}
</style>