<script setup lang="ts">
import { getRouteName } from '@/router/RouterNames';
import { DateTime } from 'luxon';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const errors = ref<string[]>([]);

const messages = ref<string[]>(['']);
const hours = ref('');
const minutes = ref('');
const timeZones = ref<string[]>([]);
const countdownRender = ref('');

const messageData = route.query['message'];
const timezoneData = route.query['timezone'];
const hoursData = route.query['hours'];
const minuteData = route.query['minutes'];

if (typeof (messageData) === 'string') {
  messages.value = [messageData];
} else if (Array.isArray(messageData)) {
  messages.value = messageData as string[];
}

if (typeof (hoursData) === 'string') {
  hours.value = hoursData;
}
if (typeof (minuteData) === 'string') {
  minutes.value = minuteData;
}

if (typeof (timezoneData) === 'string') {
  timeZones.value = [timezoneData];
} else if (Array.isArray(timezoneData)) {
  timeZones.value = timezoneData as string[];
} else {
  timeZones.value = [DateTime.now().zoneName]
}

function generateLink(): void {
  errors.value.splice(0);

  const nonEmptyMessages = messages.value.filter(x => x !== '');
  if (nonEmptyMessages.length === 0) {
    errors.value.push('A least one message needs to be filled in')
  }

  const numReg = /^\d+$/;

  let numHours = 0
  if (numReg.test(hours.value)) {
    numHours = parseInt(hours.value);

    if (numHours < 0 || numHours > 23) {
      errors.value.push('Number of hours need to be within 0 <= hours < 23')
    }
  } else {
    errors.value.push('hours value must be numerical');
  }

  let numMinutes = 0
  if (numReg.test(minutes.value)) {
    numMinutes = parseInt(minutes.value);

    if (numMinutes < 0 || numMinutes > 59) {
      errors.value.push('Number of mintues need to be within 0 <= minutes < 59')
    }
  } else {
    errors.value.push('minute value must be numerical');
  }

  const nonEmptyTimeZones = timeZones.value.filter(x => x !== '');
  if (nonEmptyTimeZones.length === 0) {
    errors.value.push('A least one time zone needs to be filled in')
  }

  if (errors.value.length > 0) {
    return;
  }

  router.replace({
    name: getRouteName('countdown-setup'),
    query: {
      message: nonEmptyMessages,
      timezone: nonEmptyTimeZones,
      hours: numHours,
      minutes: numMinutes,
    },
    hash: `#${Date.now().toString()}`,
  });

  countdownRender.value = router.resolve({
    name: getRouteName('countdown-render'),
    query: {
      message: nonEmptyMessages,
      timezone: nonEmptyTimeZones,
      hours: numHours,
      minutes: numMinutes,
    }
  }).href;
}
</script>

<template>
  <div v-if="errors.length">
    <h2>Errors</h2>
    <b>Please correct the following error(s):</b>
    <ul>
      <li v-for="error in errors">{{ error }}</li>
    </ul>
  </div>
  <br />
  <h2>Message</h2>
  <div>
    <button @click="messages.push('')">Add message</button>
    <div v-for="(m, idx) in messages">
      <textarea v-model="messages[idx]" placeholder="The text">
      </textarea>
      <button @click="messages.splice(idx, 1)">Remove</button>
    </div>
  </div>
  <h2>Time Zones</h2>
  <div>
    <button @click="timeZones.push('')">Add time zone</button>
    <br />
    <div v-for="(m, idx) in timeZones">
      <select v-model="timeZones[idx]">
        <option v-for="tz of Intl.supportedValuesOf('timeZone')" :value="tz">{{ tz }}</option>
      </select>
      <button @click="timeZones.splice(idx, 1)">Remove</button>
    </div>
  </div>
  <h2>Time to end (based on first timezone)</h2>
  <div>
    <label>Hours</label>:<input v-model="hours" placeholder="Hour of day to end timer, use 24hour time" />
    <label>Minutes</label>:<input v-model="minutes" placeholder="Mintues to end timer" />
  </div>
  <button @click="generateLink()">Generate link</button>
  <a v-if="countdownRender" class="countdown" :href="countdownRender">Start countdown</a>
</template>

<style scoped>
textarea {
  margin-top: 20px;
  margin-right: 20px;
  width: 20%;
}
</style>
