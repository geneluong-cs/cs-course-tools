<script setup lang="ts">
</script>

<template>
  <div class="container">
    <Suspense>
      <RouterView />
    </Suspense>
  </div>
</template>

<style scoped>
.container {
  flex-grow: 1;
}

</style>