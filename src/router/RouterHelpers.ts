import type { Router } from "vue-router";
import { getRouteName } from "./RouterNames";

export function getBaseRouteDetails(router: Router): RouteDetails[] {
  const results = router
    .getRoutes()
    .filter(x => x.name == getRouteName('root'))
    .flatMap(parent => parent.children.map(x => <RouteDetails>{
      name: x.name,
      description: x.meta?.description || '',
      order: x.meta?.order || 1,
    }));

  results.sort((a, b) => a.order - b.order);

  return results;
}

export interface RouteDetails {
  name: string;
  description: string;
  order: number;
}