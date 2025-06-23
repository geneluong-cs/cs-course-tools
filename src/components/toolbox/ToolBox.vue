<script setup lang="ts">
import { getRouteName } from '@/router/RouterNames';
</script>

<template>
  <header>
    <nav>
      <RouterLink v-bind:to="getRouteName('bubble-map')">Bubble Map</RouterLink>
      <RouterLink v-bind:to="getRouteName('group-assigner')">Group Assigner</RouterLink>
      <RouterLink v-bind:to="getRouteName('countdown-setup')">Countdown Setup</RouterLink>
    </nav>
  </header>
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<style scoped></style>
