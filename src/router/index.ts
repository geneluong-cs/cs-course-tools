import { createRouter, createWebHistory } from 'vue-router'
import AppVue from '@/App.vue';
import { getRouteName } from './RouterNames';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: getRouteName('root'),
      redirect: { name: getRouteName('dashboard') },
      component: AppVue,
      children: [
        {
          path: getRouteName('dashboard'),
          name: getRouteName('dashboard'),
          meta: {
            description: 'Dashboard',
            order: 10,
          },
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: getRouteName('participant-finder'),
          name: getRouteName('participant-finder'),
          meta: {
            description: 'Participant Finder',
            order: 20,
          },
          component: () => import('@/views/ParticipantFinderView.vue')
        },
        {
          path: getRouteName('zoom-fleet'),
          name: getRouteName('zoom-fleet'),
          meta: {
            description: 'Zoom Fleet',
            order: 40,
          },
          component: () => import('@/views/ZoomFleetView.vue'),
        },
        {
          path: getRouteName('tool-box'),
          name: getRouteName('tool-box'),
          meta: {
            description: 'Tool box',
            order: 50,
          },
          redirect: { name: getRouteName('bubble-map') },
          component: () => import('@/views/ToolBoxView.vue'),
          children: [
            {
              path: getRouteName('bubble-map'),
              name: getRouteName('bubble-map'),
              component: () => import('@/components/toolbox/BubbleMap/BubbleMap.vue'),
            },
            {
              path: getRouteName('group-assigner'),
              name: getRouteName('group-assigner'),
              component: () => import('@/components/toolbox/GroupAssigner/GroupAssigner.vue'),
            },
          ]
        },
      ]
    },
    {
      path: '/' + getRouteName('zoom-meeting'),
      name: getRouteName('zoom-meeting'),
      component: () => import('@/ZoomMeetingApp.vue'),
    }
  ]
});

export default router
