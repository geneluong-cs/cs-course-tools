<script setup lang="ts">
import { groupBy } from '@/utils/array-utils';
import type { ActionLog } from '../helpers/ActionLog';
import { Groups, type ClassStatus } from '../helpers/ClassConfig';
import type { InformationLog } from '../helpers/InformationLog';
import { computed, ref } from 'vue';

const props = defineProps<{
  informationLogs: InformationLog[],
  actionLogs: ActionLog[],
  timezone: string,
  classStatus: ClassStatus[],
}>();

const showEveryone = ref(false);

const groupedClass = computed(() => groupBy(props.classStatus, 'group'));
const groupValues = computed(() => {
  const results = [Groups.Unknown, Groups.Participant, Groups.Assisting];

  for (const keys of Object.keys(groupedClass.value)) {
    if (!results.includes(keys)) {
      results.push(keys);
    }
  }
  return results;
});

function getMissing(group: string): ClassStatus[] {
  const stuff = groupedClass.value[group];
  if (stuff == undefined) {
    return [];
  } else {
    const res = stuff.filter(x => x.here === false);
    res.sort((l, r) => l.finalName.localeCompare(r.finalName));
    return res
  }
}

function toggleShowEveryone() {
  showEveryone.value = !showEveryone.value;
}

</script>

<template>
  <button @click="toggleShowEveryone()">Toggle show everyone</button>
  <div v-for="group of groupValues">
    <div v-if="groupedClass[group] !== undefined">
      <div v-if="showEveryone">
        <h2>Group {{ group }} Total: {{ groupedClass[group].length }}</h2>
        <div v-for="part of groupedClass[group]"> {{ part.finalName }}: {{ part.here ? 'here' : 'Not here' }} </div>
      </div>
      <div v-else>
        <h2>Group {{ group }} Missing: {{ getMissing(group).length }} / {{ groupedClass[group].length }}</h2>
        <div v-for="part of getMissing(group)"> {{ part.finalName }} </div>
      </div>
    </div>
  </div>
</template>