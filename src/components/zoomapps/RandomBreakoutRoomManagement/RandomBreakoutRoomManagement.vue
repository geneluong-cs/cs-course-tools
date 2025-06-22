<script setup lang="ts">
import type { ActionLog } from '../helpers/ActionLog';
import type { InformationLog } from '../helpers/InformationLog';
import type { ClassStatus } from '../helpers/ClassConfig';
import BaseBreakoutRoomManagement from './BaseBreakoutRoomManagement.vue';

const props = defineProps<{
  informationLogs: InformationLog[],
  actionLogs: ActionLog[],
  timezone: string,
  classStatus: ClassStatus[],
}>();

</script>


<template>
  <BaseBreakoutRoomManagement :timezone="timezone" :class-status="classStatus" :mode="'random'">
  </BaseBreakoutRoomManagement>

</template>
