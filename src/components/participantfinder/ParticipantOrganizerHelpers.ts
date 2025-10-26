
import { toWindows, groupBy, distinct } from '../../utils/array-utils'

export function nameToPerson(name: string): Person {
  return {
    name: name,
    normalizedName: name.toLowerCase(),
  };
}

// Internal
export function convertPersonToNgram(person: Person, ngramLength: number): NgramPerson[] {
  return toWindows(person.normalizedName.split(''), ngramLength)   // [ 'a', 'b' ]
    .map(x => x.reduce((y, z) => y + z))                      // 'ab'
    .map(x => {
      return {
        ngram: x,
        person: person
      };
    });
}

// Internal
function allocatePeopleToNgramGroup(
  allNames: Person[],
  groupedNgrams: [string, NgramPerson[]][],
  namesCountCutoff: number): ParsedNgramPerson[] {

  let namesLeft = allNames.slice();

  return groupedNgrams.map(x => {
    const [ngram, names] = x;

    let namesLeftIndexes = names
      .map(x => namesLeft.findIndex(y => x.person.normalizedName === y.normalizedName))
      .filter(x => x >= 0);

    let shouldRemoveNamesLeft = names.length <= namesCountCutoff;

    const unseenPeople = names.filter(x => shouldRemoveNamesLeft && namesLeft.includes(x.person)).map(x => x.person.normalizedName);

    if (shouldRemoveNamesLeft) {
      namesLeftIndexes.sort((a, b) => b - a); // remove in reverse index order
      namesLeftIndexes.forEach(x => {
        if (x >= 0) {
          namesLeft.splice(x, 1);
        }
      })
    }
    return <ParsedNgramPerson>{
      ngram,
      people: names.map(x => x.person),
      unseenPeopleNames: shouldRemoveNamesLeft ? unseenPeople : [],
    };
  })
}

export function groupPeopleToNgrams(
  names: Person[],
  ngramLength: number,
  namesCountCutoff: number): ParsedNgramPerson[] {

  const ngramToNames = names
    .flatMap(x => convertPersonToNgram(x, ngramLength));

  const unsortedGroupedNgrams = groupBy(ngramToNames, 'ngram');

  const groupedNgrams: [string, NgramPerson[]][] = Object.keys(unsortedGroupedNgrams)
    .map(key => {
      let uniqueNames = distinct(unsortedGroupedNgrams[key] as NgramPerson[], x => x.person.normalizedName);

      uniqueNames.sort((a, b) => a.person.normalizedName.localeCompare(b.person.normalizedName));
      return [
        key,  // ngram 'ab'
        uniqueNames // [ bob, sam ]
      ];
    });

  // sort by uniqueNames length so that the largest lists are searched first
  groupedNgrams.sort((a, b) => b[1].length - a[1].length);

  return allocatePeopleToNgramGroup(names, groupedNgrams, namesCountCutoff);
}

export interface Person {
  name: string;
  normalizedName: string;
}

export interface NgramPerson {
  ngram: string;
  person: Person;
}

export interface ParsedNgramPerson {
  ngram: string;
  people: Person[];
  unseenPeopleNames: string[];
}
