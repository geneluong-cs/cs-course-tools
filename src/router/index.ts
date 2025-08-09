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
          path: getRouteName('zoom-apps'),
          name: getRouteName('zoom-apps'),
          meta: {
            description: 'Zoom Apps',
            order: 30,
          },
          component: () => import('@/views/ZoomApps.vue'),
          redirect: { name: getRouteName('zoom-apps-logs') },
          children: [
            {
              path: getRouteName('zoom-apps-logs'),
              name: getRouteName('zoom-apps-logs'),
              component: () => import('@/components/zoomapps/ZoomAppLogs/ZoomAppLogs.vue'),
            },
            {
              path: getRouteName('zoom-apps-report-status'),
              name: getRouteName('zoom-apps-report-status'),
              component: () => import('@/components/zoomapps/ReportStatus/ReportStatus.vue'),
            },
            {
              path: getRouteName('zoom-apps-random-breakout-room-management'),
              name: getRouteName('zoom-apps-random-breakout-room-management'),
              component: () => import('@/components/zoomapps/RandomBreakoutRoomManagement/RandomBreakoutRoomManagement.vue'),
            },
            {
              path: getRouteName('zoom-apps-group-breakout-room-management'),
              name: getRouteName('zoom-apps-group-breakout-room-management'),
              component: () => import('@/components/zoomapps/GroupBreakoutRoomManagement/GroupBreakoutRoomManagement.vue'),
            },
          ]
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
            {
              path: getRouteName('countdown-setup'),
              name: getRouteName('countdown-setup'),
              component: () => import('@/components/toolbox/CountdownTimer/CountdownSetup.vue'),
            },
          ]
        },
      ]
    },
    {
      path: '/' + getRouteName('zoom-meeting'),
      name: getRouteName('zoom-meeting'),
      component: () => import('@/ZoomMeetingApp.vue'),
    },
    {
      path: '/' + getRouteName('countdown-render'),
      name: getRouteName('countdown-render'),
      component: () => import('@/CountdownRender.vue'),
    }
  ]
});

export default router
