<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { getBaseRouteDetails } from './router/RouterHelpers';

const router = useRouter();

const baseRoutes = getBaseRouteDetails(router);

const version = APP_VERSION;

</script>

<template>
  <header>
    <RouterLink class="logo" to="/"></RouterLink>
    <nav>
      <RouterLink v-for="r of baseRoutes" v-bind:to="'/' + r.name">{{ r.description }}</RouterLink>
    </nav>
    <div class="padding"></div>
    <div>
      <div>v{{ version }}</div>
    </div>
  </header>
  <RouterView />
</template>

<style scoped>
.padding {
  flex-grow: 1;
}

@media (min-width: 1024px) {
  .logo {
    margin: 0 1rem 0.5rem 0;
  }
}
</style>
