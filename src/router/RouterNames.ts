const routeNames = [
  'root',
  'dashboard',
  'participant-finder',
  'tool-box',
  'bubble-map',
  'group-assigner',
  'countdown-timer',
  'preparation-tools',
  'preparation-tool-selection',
  'list-of-list',
  'event-tools',
  'event-tool-selection',
  'event-detail',
  'participant-detail',
  'participant-registration',
  'guest-summary-by-introduction',
  'guest-summary-by-invitation',
  'guest-detail',
  'guest-registration',
  'login',
  'zoom-apps',
  'zoom-apps-random-breakout-room-management',
  'zoom-apps-group-breakout-room-management',
  'zoom-apps-logs',
  'zoom-apps-report-status',
  'zoom-meeting',
  'zoom-fleet',
] as const;

export type RouterKeyType = typeof routeNames[number];

export function getRouteName(route: RouterKeyType): string {
  return route;
}
