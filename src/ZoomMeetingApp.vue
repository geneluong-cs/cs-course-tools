<script setup lang="ts">
import ZoomMtgEmbedded from "@zoom/meetingsdk/embedded"
import { onMounted, ref } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { useSessionStore } from './stores/Session';

const client = ZoomMtgEmbedded.createClient();
const route = useRoute();
const meetingEl = ref(null as any as HTMLElement);
const errorMessage = ref('');
const userName = ref('');
const sessionStore = useSessionStore();

onMounted(async () => {
  initClient();
  await joinMeeting();
});

window.addEventListener('beforeunload', evt => {
  client.leaveMeeting();
});

onBeforeRouteLeave((to, from, next) => {
  client.leaveMeeting();
});

async function joinMeeting() {
  const meeting = route.query['meeting'] as string;
  const name = route.query['name'] as string;
  const password = route.query['password'] as string;
  const zoomSignature = sessionStore.getZoomSignature();

  if (!meeting || !name) {
    errorMessage.value = "query parameter 'meeting' or 'name' was not specified but was expected";
    return;
  }

  userName.value = name;
  document.title = name;

  client.join({
    sdkKey: zoomSignature.sdkKey,
    signature: zoomSignature.signature,
    meetingNumber: meeting,
    password: password,
    userName: name,
  });
}

function initClient() {
  client.init({
    debug: true,
    zoomAppRoot: meetingEl.value,
    language: 'en-US',
    customize: {
      meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
    }
  });
}

</script>

<template>
  <main>
    <div>{{ errorMessage }}</div>
    <h2 class="user-name">{{ userName }}</h2>
    <div ref="meetingEl"></div>
  </main>
</template>

<style scoped>
.user-name {
  text-align: center;
}
</style>