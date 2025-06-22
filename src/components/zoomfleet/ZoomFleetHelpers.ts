import { fakeNames } from '../participantfinder/dev-helper';
import { random } from '@/utils/random-utils';

export const maxFakeNameCount = fakeNames.length;

export function generateNames(devices: number, seed: number): string[] {
  const r = random(seed);
  const names = fakeNames.slice();
  const results: string[] = [];

  for (var i = 0; i < devices; i++) {
    const index = r.next() * names.length;
    const nameToInclude = names.splice(index, 1);
    results.push(...nameToInclude);
  }

  return results;
}

export function generateAlphabeticalNames(devices: number): string[] {
  const names = fakeNames.slice();
  names.sort();
  if (devices < names.length) {
    names.splice(devices);
  }
  return names;
}