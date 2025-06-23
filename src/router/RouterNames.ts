const routeNames = [
  'root',
  'dashboard',

  'participant-finder',

  'tool-box',
  'bubble-map',
  'group-assigner',
  'countdown-setup',

  'zoom-meeting',

  'zoom-fleet',

  'countdown-render',
] as const;

export type RouterKeyType = typeof routeNames[number];

export function getRouteName(route: RouterKeyType): string {
  return route;
}
