<script lang="ts" setup>
import ParticipantFinder from '@/components/participantfinder/ParticipantOrganizer.vue'
</script>

<template>
  <div class="finder">
    <h1>Participant Finder</h1>
    <ParticipantFinder></ParticipantFinder>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .finder {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
}
</style>
