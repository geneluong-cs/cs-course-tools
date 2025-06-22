<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { getRouteName } from '@/router/RouterNames';
import { generateAlphabeticalNames, generateNames, maxFakeNameCount } from './ZoomFleetHelpers';
import { KJUR } from 'jsrsasign';
import { useSessionStore } from '@/stores/Session';

const router = useRouter();
const route = useRoute();
const errors = ref(new Array<string>());
const names = ref(new Array<string>());
const devices = maxFakeNameCount;

const sessionStore = useSessionStore();

const queryMeeting = route.query['meeting'] as string;
const queryPassword = route.query['password'] as string;
const querySeed = parseInt(route.query['seed'] as string);

const meetingId = ref(queryMeeting);
const meetingPassword = ref(queryPassword);
const seed = ref(isNaN(querySeed) ? 7 : querySeed);

const sdkKey = ref('');
const sdkSecret = ref('');

function generateLinks(): void {
  errors.value.splice(0);

  if (!meetingId.value) {
    errors.value.push('Meeting id is required');
  }

  if (errors.value.length === 0) {
    router.replace({
      path: getRouteName("zoom-fleet"),
      query: {
        meeting: meetingId.value,
        password: meetingPassword.value || '',
        seed: seed.value
      }
    });

    names.value = seed.value === -1 ? generateAlphabeticalNames(devices) : generateNames(devices, seed.value);
  }
}

function getUrl(name: string): string {
  return router.resolve({
    name: getRouteName('zoom-meeting'),
    query: {
      meeting: meetingId.value,
      password: meetingPassword.value || undefined,
      name: name
    }
  }).href;
}


function setSignature(): void {

  errors.value.splice(0);

  if (!meetingId.value) {
    errors.value.push('Meeting id is required');
  }
  if (!sdkKey.value) {
    errors.value.push('SDK Key is required');
  }
  if (!sdkSecret.value) {
    errors.value.push('SDK Secret is required');
  }

  if (errors.value.length > 0) {
    return;
  }
  const iat = Math.round(new Date().getTime() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;

  const oHeader = { alg: 'HS256', typ: 'JWT' };

  const oPayload = {
    sdkKey: sdkKey.value,
    mn: meetingId.value,
    role: 0,
    iat: iat,
    exp: exp,
    appKey: sdkKey.value,
    tokenExp: iat + 60 * 60 * 2
  };

  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  const signature = KJUR.jws.JWS.sign('HS256', sHeader, sPayload, sdkSecret.value);

  sessionStore.setZoomSignature(sdkKey.value, signature);
}

function removeSignature(): void {
  sessionStore.removeZoomSignature();
}

</script>

<template>

  <div class="centered">
    <div>
      <div>
        <h2>Notes</h2>
        <p>Devices can leave the meeting by closing the tab</p>
        <p>To quickly open link, you can use the mouse's 'middle' click button - usually the mouse wheel itself, on the
          links themselves</p>
        <p>If devices get stuck inside a meeting, close all browsers and wait for the devices to leave before trying
          again</p>
        <p>It is recommended that you use a browser with 'close tabs to the right' (when you right click the tab at the
          top of this page) feature to quickly leave the meeting e.g. firefox, chrome</p>
      </div>
      <br />
      <h2>Errors</h2>
      <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
      </p>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
      <br />
      <h2>Meeting Signature</h2>
      <div>
        <a href="https://developers.zoom.us/docs/meeting-sdk/developer-accounts/#get-meeting-sdk-credentials"
          target="_blank">Get your account SDKs here</a>
      </div>
      <br />
      <div class="centered">
        <div class="form">
          <label>
            SDK key
            <input v-model="sdkKey" />
          </label>
          <label>
            SDK Secret
            <input v-model="sdkSecret" />
          </label>
          <br />
          <button @click="setSignature">Set Signature</button>
          <button @click="removeSignature">Clear Signature</button>
        </div>
      </div>
      <h2>Meeting selection</h2>
      <br />
      <div class="centered">
        <div class="form">
          <label>
            Meeting Id
            <input v-model="meetingId" />
          </label>
          <br />
          <label>
            Meeting password (blank if none)
            <input v-model="meetingPassword" />
          </label>
          <br />
          <label>
            Seed for name generation (-1 for alphabetical)
            <input type="number" v-model.number="seed" />
          </label>
          <br />
          <button @click="generateLinks">Generate links</button>
        </div>
      </div>
      <br />
      <h2 v-if="names.length > 0">The links</h2>
      <ol class="meetings">
        <li v-for="n of names"><a class="meeting-link" :href="getUrl(n)" target="_blank">{{ n }}</a></li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.form {
  text-align: right;
}

.meetings {
  column-width: 10em;
  column-count: 10;
}
</style>
