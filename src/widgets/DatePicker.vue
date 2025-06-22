<script setup lang="ts">
import { DateTime } from 'luxon';
import { ref, type Ref } from 'vue';

const emit = defineEmits<{
   (event: 'change', dateTime: DateTime): void
}>()

const props = defineProps<{
  dateTime: DateTime,
  description: string
}>();

const dateCopy = ref(props.dateTime);

function format(input: string): DateTime {
  const result = DateTime.fromFormat(input, 'yyyy-MM-dd');
  emit('change', result);
  return result;
}
</script>

<template>
  <div>
    <label>{{ description }}</label>
    <input type="date" 
      v-bind:value="dateCopy.toFormat('yyyy-MM-dd')" 
      v-on:input="dateCopy = format(($event.target as HTMLInputElement).value)">
  </div>
</template>

<style scoped>

</style>