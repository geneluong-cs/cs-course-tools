<script lang="ts" setup>
import { ref, computed } from 'vue';
import { fakeNames } from './dev-helper';
import { groupPeopleToNgrams, nameToPerson, type Person } from './ParticipantOrganizerHelpers';

const nameInputs = ref(fakeNames.join('\n'));
const peopleHere = ref(new Array<string>());
const isDebug = ref(false);
const ngramLength = ref(2);
const groupCountCutoff = ref(10);
const hideGroupWhenComplete = ref(false);

const rawZoomName = computed(() => {
  const names = nameInputs.value.split('\n');
  names.sort();
  return names.map(nameToPerson);
})

const parsedNgramPeople = computed(() => {
  const peopleHereCopy = peopleHere.value;

  return groupPeopleToNgrams(rawZoomName.value, ngramLength.value, groupCountCutoff.value)
    .filter(x => isDebug.value ? true : x.unseenPeopleNames.length > 0)
    .filter(x => hideGroupWhenComplete.value ? !x.people.every(z => peopleHereCopy.includes(z.normalizedName)) : true);
})

function isHere(person: Person): boolean {
  return peopleHere.value.includes(person.normalizedName);
}

function toggleHere(person: Person): void {
  const index = peopleHere.value.indexOf(person.normalizedName);
  if (index >= 0) {
    peopleHere.value.splice(index, 1);
  } else {
    peopleHere.value.push(person.normalizedName);
  }
}

function resetHere(): void {
  peopleHere.value.splice(0, peopleHere.value.length);
}

</script>

<template>
  <div class="container">
    <div class="people-info">
      <textarea class="zoom-names" v-model="nameInputs"></textarea>
      <div>
        <ul>
          <li v-for="z in rawZoomName" 
              class="person-name"
              :class="{ 'is-here': isHere(z) }"
              @click="toggleHere(z)">
              {{ z.name }}
          </li>
        </ul>
      </div>
    </div>
    <div>
      <div>
        <h2>Options | {{ peopleHere.length }}/{{ rawZoomName.length }} </h2>
        <div>
          <label>
            Ngram Length
            <input type="number" v-model="ngramLength"/>
          </label>
          <label>
            Group Count Cutoff
            <input type="number" v-model="groupCountCutoff"/>
          </label>
          <label>
            Hide group when everyone is here
            <input type="checkbox" v-model="hideGroupWhenComplete"/>
          </label>
          <label>
            Debug
            <input type="checkbox" v-model="isDebug"/>
          </label>
          <label>
            <button type="button" @click="resetHere()">Reset 'here'</button>
          </label>
        </div>
      </div>
      <div class="people-group-container">
        <div class="people-group" v-for="z in parsedNgramPeople">
          <div>
            "{{ z.ngram }}" ({{ z.unseenPeopleNames.length }}/{{ z.people.length }})
          </div>
          <ul>
            <li v-for="x in z.people"
                class="person-name"
                :class="{ unseen: z.unseenPeopleNames.includes(x.normalizedName), 'is-here': isHere(x) }"
                @click="toggleHere(x)">
              {{ x.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    align-items: flex-start;
  }
  .zoom-names {
    min-height: 700px;
    max-width: 200px;  /* TODO: Switch to flex */
  }

  label {
    border-width: 1px;
    border-style: solid;
    padding: 0.25em;
  }

  .person-name {
    transition: background-color 1s ease-out 0s;
  }

  .people-info {
    display: flex;
  }

  .people-group-container {
    display: flex;
    flex-wrap: wrap;
  }

  .people-group {
    margin: 1em;
  }

  li.unseen {
    background-color: var(--primary-color);
  }

  li.is-here {
    background-color: var(--secondary-color);
  }

</style>
