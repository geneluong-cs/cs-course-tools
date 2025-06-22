<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { assignGroups, getGroupSummary, rejoin, type IParticipant } from './GroupHelpers';


const nameInputs = ref('');
const groupCountInput = ref(6);

const participants = computed<IParticipant[]>(() => {
  if (isNaN(groupCountInput.value) || groupCountInput.value <= 0) {
    return [];
  }

  const parsedInputs = nameInputs.value.split('\n').filter(r => r !== '').map(r => r.split('\t'));

  const headings = parsedInputs.shift();
  if (headings === undefined) {
    // handle
    return [];
  }
  const nameIndex = headings.findIndex(e => e.toLocaleLowerCase() === 'name');

  if (nameIndex < 0) {
    // handle
    return [];
  }

  // handle duplicate names

  const results = new Array<IParticipant>();
  for (const row of parsedInputs) {
    const participant = Array.from(headings.keys()).reduce((prev, next) => {
      return next === nameIndex || row[next] === '' ?
        prev :
        {
          [headings[next]]: row[next],
          ...prev
        }
    }, {
      name: row[nameIndex]
    } as IParticipant)
    results.push(participant);
  }
  return results;
});

const groups = computed(() => {
  const result = assignGroups(participants.value, groupCountInput.value);
  return result.map(r => {
    r.sort();
    return r;
  });
});

</script>

<template>

  <label>Participants in each group</label>
  <input v-model="groupCountInput" type="number" min="2"></input>
  <textarea class="zoom-names" v-model="nameInputs"></textarea>
  <div>
    <div v-for="(g, index) in groups">

      <div>Group {{ index + 1 }}</div>
      <div class="group-summary">
        <div v-for="k of getGroupSummary(rejoin(g, participants))">
          {{ k[0] }}: {{ k[1] }}
        </div>
      </div>
      <ul>
        <li v-for="name of g"> {{ name }} </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.zoom-names {
  min-height: 300px;
}

.group-summary {
  display: flex;
  border: 1px solid;
}

.group-summary>div {
  margin-left: 30px;
  margin-right: 30px;
}
</style>
