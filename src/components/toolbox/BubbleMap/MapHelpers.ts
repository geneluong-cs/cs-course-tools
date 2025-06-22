import { ascii85 } from "./ascii85";

export function prettyPrintCity(city: ICity): string {
  return `${city.description} / ${city.admin_name} / ${city.name}`; 
}

export function encodeCities(cities: ICity[]): string {

  const str = JSON.stringify(cities);
  const str2 = ascii85.encode(str);
  return btoa(str2);
}

export function decodeCities(str: string): ICity[] {
  try {
    const str2 = atob(str);
    const str3 = ascii85.decode(str2, 'UTF-8');
    const obj = JSON.parse(str3)
    if (obj) {
      return obj as ICity[];
    }
  } catch {
  }

  return [];
}

export function convert(x: any): ICity {
  return { 
    description: x.city_ascii,
    admin_name: x.admin_name,
    latitude: x.lat,
    longitude: x.lng,
    name: x.country,
    value: 0,
  };
}

export interface ICity {
  description: string;
  admin_name: string | undefined;
  latitude: number;
  longitude: number;
  name: string;
  value: number;
}

