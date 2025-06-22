import { describe, it, expect } from 'vitest'

import { convertPersonToNgram, type NgramPerson, type Person } from '../ParticipantOrganizerHelpers';
import { nameToPerson } from '../ParticipantOrganizerHelpers';

describe('nameToPerson', () => {
  it('converts a normal name without modification', () => {
    const expected: Person = {
      name: 'bob',
      normalizedName: 'bob',
    };

    const res = nameToPerson('bob');

    expect(res).toEqual(expected);
  });

  it('normalizes names as lower case', () => {
    const expected: Person = {
      name: 'BOB',
      normalizedName: 'bob',
    };

    const res = nameToPerson('BOB');

    expect(res).toEqual(expected);
  });
});

describe('convertPersonToNgram', () => {
  it('splits normalize name up', () => {
    const input = {
      normalizedName: 'bob',
    } as Partial<Person>;
    const person = input as Person;

    const expected: NgramPerson[] = [
      'bo', 'ob'
    ].map(x => {
      return {
        ngram: x,
        person: person
      }
    });

    const res = convertPersonToNgram(person, 2);

    expect(res).toEqual(expected);
  });

  it('splits normalize name up by ngram length', () => {
    const input = {
      normalizedName: 'bobby',
    } as Partial<Person>;
    const person = input as Person;

    const expected: NgramPerson[] = [
      'bob', 'obb', 'bby'
    ].map(x => {
      return {
        ngram: x,
        person: person
      }
    });

    const res = convertPersonToNgram(person, 3);

    expect(res).toEqual(expected);
  });

  it('can return duplicated ngrams', () => {
    const input = {
      normalizedName: 'bobo',
    } as Partial<Person>;
    const person = input as Person;

    const expected: NgramPerson[] = [
      'bo', 'ob', 'bo'
    ].map(x => {
      return {
        ngram: x,
        person: person
      }
    });

    const res = convertPersonToNgram(person, 2);

    expect(res).toEqual(expected);
  });

  it('handles names with spaces', () => {
    const input = {
      normalizedName: 'bob the builder',
    } as Partial<Person>;
    const person = input as Person;

    const expected: NgramPerson[] = [
      'bob the bu', 'ob the bui', 'b the buil', ' the build', 'the builde', 'he builder'
    ].map(x => {
      return {
        ngram: x,
        person: person
      }
    });

    const res = convertPersonToNgram(person, 10);

    expect(res).toEqual(expected);
  });
});