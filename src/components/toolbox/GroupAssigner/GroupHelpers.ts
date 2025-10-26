import { fold, groupBy } from "@/utils/array-utils";

export function assignGroups(participants: IParticipant[], maxNumbers: number): string[][] {
  if (participants.length === 0) {
    return [];
  }

  const numGroups = Math.ceil(participants.length / maxNumbers);
  const attributes = getAllAttributes(participants);
  const wholeSummary = new Map(Array.from(getGroupSummary(participants)).map(a => [a[0], Math.ceil(a[1] / numGroups)]));

  // sorted from least -> most flexible attribute, based on how many are filled in
  const attributeFlexibilityMap = (attributes
    .map(attr => [attr, participants.filter(p => p[attr] != undefined).length]) as [string, number][])
    .sort((l, r) => l[1] - r[1])
    .filter(x => x[1] > 0)
    .map(x => x[0]);


  // sort by participants with the most attributes first
  // then by the most restrictive attribute
  // this encourages the trickier ones get assigned to groups first
  const remainingParticipants = participants.slice();
  remainingParticipants.sort((l, r) => {
    const attribuesRes = getAllAttributes([r]).length - getAllAttributes([l]).length;
    if (attribuesRes !== 0) {
      return attribuesRes;
    }
    return fold((acc, attr) => {
      if (acc !== 0) {
        return acc;
      } else {
        const lVal = l[attr];
        const rVal = r[attr];

        if (lVal !== undefined && rVal === undefined) {
          return -1;
        } if (lVal === undefined && rVal !== undefined) {
          return 1;
        } if (lVal === undefined && rVal === undefined) {
          return 0;
        } if (lVal === rVal) {
          return 0;
        } else {
          return l.name.localeCompare(r.name);
        }
      }
    }, 0, attributeFlexibilityMap)
  });

  const groupResults = Array.from({ length: numGroups }, x => new Array<IParticipant>());

  for (const person of remainingParticipants) {

    const personAttributesOrdered = new Set(getAllAttributes([person]));

    const groupSummary: [number, Map<string, number>][] = groupResults.flatMap((x, i) => {
      const groupSumm = getGroupSummary(x);

      const hasOver = Array.from(personAttributesOrdered).find(attr => (groupSumm.get(`${attr}:${person[attr]}`) || 0) >= (wholeSummary.get(`${attr}:${person[attr]}`) || 999));

      if (hasOver === undefined) {
        return [[i, groupSumm]];
      } else {
        return [];
      }
    });

    const groupSuggestions = attributes.flatMap(attributeFocus => {
      if (!personAttributesOrdered.has(attributeFocus) || person[attributeFocus] === undefined) {
        return [];
      }

      // Select groups with the least number of attribute key / value pair
      const groupMatches: [number, number][] = groupSummary.map(a => [a[0], a[1].get(`${attributeFocus}:${person[attributeFocus]}`) || 0]);

      const minMatches = groupMatches.reduce((prev, next) => Math.min(prev, next[1]), 99999);

      return groupMatches.filter(x => x[1] == minMatches).map(x => {
        return {
          num: x[0]
        };
      });
    });

    // Group by the group index
    const attributesSuggestionsGrouped = groupBy(groupSuggestions, 'num');
    // Find the groups with the largest concensus
    const mostGroupMatches = Object.keys(attributesSuggestionsGrouped).reduce((prev, attr) => Math.max((attributesSuggestionsGrouped[attr] || []).length, prev), -1);
    const candidateGroups = Object.keys(attributesSuggestionsGrouped).filter(attr => (attributesSuggestionsGrouped[attr] || []).length === mostGroupMatches).map(x => parseInt(x));

    if (candidateGroups.length > 0) {
      const filteredCandidates = groupResults.filter((val, index) => candidateGroups.includes(index));
      const smallestGroup = selectSmallestGroup(filteredCandidates);
      smallestGroup.push(person);
    } else {

      console.log(`${person.name} is unmatched putting it in group with least amount of people`);
      const smallestGroup = selectSmallestGroup(groupResults);
      smallestGroup.push(person);
    }
  }

  return groupResults.map(x => x.map(y => y.name));
}

function selectSmallestGroup(groupResults: IParticipant[][]): IParticipant[] {
  const groupMatches = groupResults.map((a, index) => [index, a.length]);

  const min = groupMatches.reduce((prev, next) => Math.min(prev, next[1] as number), 99999);

  const groupCandidates = groupMatches.filter(x => x[1] == min);
  // The group with the lowest index
  groupCandidates.sort((l, r) => (l[1] || 0) - (r[1] || 0));
  return groupResults[(groupCandidates[0] || [])[0] || 0] || [];
}

export function getGroupSummary(participants: IParticipant[]): Map<string, number> {
  if (participants.length === 0) {
    return new Map();
  }

  const attributes = getAllAttributes(participants);
  attributes.sort();

  return fold((acc, attr) => {
    const groupedAttributeValues = groupBy(participants, attr);
    const seed = Object.keys(groupedAttributeValues);
    seed.sort();
    return fold((acc2, attr2) => {
      if (attr2 !== 'undefined' && attr2 !== '') {
        acc2.set(`${attr}:${attr2}`, groupedAttributeValues[attr2]!.length);
      }
      return acc2;
    }, acc, seed)
  }, new Map(), attributes);
}

function getAllAttributes(participants: IParticipant[]): string[] {
  return [...new Set(participants.flatMap(p => Object.keys(p).filter(a => p[a] !== undefined)))].filter(a => a !== 'name');
}

export function rejoin(participants: string[], originalParticipants: IParticipant[]): IParticipant[] {
  return participants.map(p => originalParticipants.find(op => op.name == p) as IParticipant);
}

export interface IParticipant {
  name: string;
  [key: string]: string | undefined
};