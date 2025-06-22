import { describe, it, expect } from 'vitest'
import { assignGroups, getGroupSummary, rejoin, type IParticipant } from '../GroupHelpers';

describe('assignGroups', () => {
  it('Even gender with groups', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, undefined, undefined),
      createParticipant('b', 'M', undefined, undefined, undefined),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'F', undefined, undefined, undefined),
    ]
    const res = assignGroups(parts, 2);

    assertIsCompliant(res, parts);
  });

  it('Unbalanced genders get bucketed together', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, undefined, undefined),
      createParticipant('b', 'M', undefined, undefined, undefined),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'F', undefined, undefined, undefined),
      createParticipant('e', 'M', undefined, undefined, undefined),
    ]
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });

  it('Dangling participant is included in results', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, undefined, undefined),
      createParticipant('b', 'M', undefined, undefined, undefined),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'F', undefined, undefined, undefined),
      createParticipant('e', undefined, undefined, undefined, undefined),
    ]
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });

  it('two attributes are split evenly', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, 'Y', undefined),
      createParticipant('b', 'F', undefined, 'Y', undefined),
      createParticipant('c', 'M', undefined, 'Y', undefined),
      createParticipant('d', 'F', undefined, undefined, undefined),
    ];
    const res = assignGroups(parts, 2);

    assertIsCompliant(res, parts);
  });

  it('Ensure the secondary attribute does not violate the maximum attribute pair', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, 'Y', undefined),
      createParticipant('b', 'M', undefined, 'Y', undefined),
      createParticipant('c', 'M', undefined, 'Y', undefined),
      createParticipant('d', 'F', '1', undefined, undefined),
      createParticipant('e', 'F', undefined, undefined, undefined),
    ];
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });

  it('all attributes are considered, regardless of ordering', () => {
    const parts: IParticipant[] = [
      createParticipant('e', 'F', undefined, undefined, undefined),
      createParticipant('d', 'F', '1', undefined, undefined),
      createParticipant('c', 'M', undefined, 'Y', undefined),
      createParticipant('b', 'M', undefined, 'Y', undefined),
      createParticipant('a', 'M', undefined, 'Y', undefined),
    ];
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });

  it('groups consider possible places to be put', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'F', undefined, undefined, undefined),
      createParticipant('b', 'M', undefined, undefined, undefined),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'M', undefined, undefined, undefined),
      createParticipant('e', 'F', undefined, undefined, undefined),
      createParticipant('f', 'M', undefined, undefined, undefined),
      createParticipant('g', 'F', undefined, undefined, undefined),
      createParticipant('h', 'M', undefined, undefined, undefined),
      createParticipant('i', 'F', undefined, undefined, undefined),
      createParticipant('j', 'M', undefined, undefined, undefined),
    ];
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });

  it('groups consider possible places to be put with mulitple attributes', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'F', 'Rel1', undefined, undefined),
      createParticipant('b', 'M', 'Rel1', undefined, 'Y'),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'M', undefined, undefined, undefined),
      createParticipant('e', 'F', 'Rel2', undefined, undefined),
      createParticipant('f', 'M', 'Rel2', undefined, undefined),
      createParticipant('g', 'F', 'Rel2', undefined, 'Y'),
      createParticipant('h', 'M', undefined, undefined, undefined),
      createParticipant('i', 'F', undefined, undefined, undefined),
      createParticipant('j', 'M', undefined, undefined, 'Y'),
    ];
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });

  it('disallow tie breakers to violate going over attributes', () => {
    const parts: IParticipant[] = [
      createParticipant('Mason', 'M', 'Rel1', undefined, undefined),
      createParticipant('Benjamin', 'F', 'Rel1', 'Y', 'Y'),
      createParticipant('Isabel', 'M', undefined, undefined, undefined),
      createParticipant('Julian', 'F', undefined, undefined, undefined),
      createParticipant('Bianca', 'M', 'Rel2', 'Y', undefined),
      createParticipant('Skye', 'F', 'Rel2', undefined, undefined),
      createParticipant('Dominic', 'M', 'Rel2', 'Y', 'Y'),
      createParticipant('Hunter', 'F', undefined, undefined, undefined),
      createParticipant('# Joel', 'M', undefined, 'Y', undefined),
      createParticipant('Alexandra', 'F', undefined, undefined, 'Y'),
      createParticipant('Taylah', 'M', undefined, undefined, undefined),
      createParticipant('Patrick', 'F', undefined, undefined, undefined),
      createParticipant('Eden', 'M', undefined, undefined, undefined),
    ];
    const res = assignGroups(parts, 8);

    assertIsCompliant(res, parts);
  });

  it('tricky', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, 'Y', undefined),
      createParticipant('b', 'M', undefined, 'Y', undefined),
      createParticipant('c', 'M', undefined, 'Y', undefined),
      createParticipant('d', 'F', '1', undefined, undefined),
      createParticipant('e', 'F', undefined, undefined, undefined),
    ];
    const res = assignGroups(parts, 3);

    assertIsCompliant(res, parts);
  });
});


describe('getGroupSummary', () => {
  it('Gets summary', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, undefined, undefined),
      createParticipant('b', 'M', undefined, undefined, undefined),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'F', undefined, undefined, undefined),
    ]
    const res = getGroupSummary(parts);

    const expected = new Map([
      ['gender:M', 2],
      ['gender:F', 2],
    ]);

    expect(res).toEqual(expected);
  });

  it('Includes all attributes', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, undefined, undefined),
      createParticipant('b', 'M', undefined, undefined, 'Y'),
      createParticipant('c', 'F', undefined, undefined, undefined),
      createParticipant('d', 'F', undefined, undefined, undefined),
    ]
    const res = getGroupSummary(parts);

    const expected = new Map([
      ['gender:M', 2],
      ['gender:F', 2],
      ['ilp:Y', 1],
    ]);

    expect(res).toEqual(expected);
  });

  it('scrubs empty data', () => {
    const parts: IParticipant[] = [
      createParticipant('a', 'M', undefined, undefined, ''),
      createParticipant('b', 'M', undefined, undefined, ''),
      createParticipant('c', 'F', undefined, undefined, ''),
      createParticipant('d', 'F', undefined, undefined, 'Y'),
    ]
    const res = getGroupSummary(parts);

    const expected = new Map([
      ['gender:M', 2],
      ['gender:F', 2],
      ['ilp:Y', 1],
    ]);

    expect(res).toEqual(expected);
  });
});


function assertIsCompliant(res: string[][], participants: IParticipant[]): void {
  const j = res.map(r => rejoin(r, participants));
  const wholeSummary = new Map(Array.from(getGroupSummary(participants)).map(a => [a[0], Math.ceil(a[1] / res.length)]));

  // console.log(wholeSummary);

  const violations = [];
  for (const [index, part] of j.entries()) {
    const summary = getGroupSummary(part);
    // console.log(index);
    // console.log(summary);

    for (const kvp of summary) {

      if (kvp[1] > (wholeSummary.get(kvp[0]) as number)) {

        violations.push(`Group ${index} violated the attribute ${kvp[0]} with ${kvp[1]} but group average is ${wholeSummary.get(kvp[0])}`);

      }
    }
  }

  if (violations.length > 0) {
    console.log(j);
    throw violations;
  }
}

function createParticipant(
  name: string,
  gender: string | undefined,
  relationship: string | undefined,
  reviewer: string | undefined,
  ilp: string | undefined): IParticipant {
  return {
    name,
    gender,
    relationship,
    reviewer,
    ilp,
  }
}