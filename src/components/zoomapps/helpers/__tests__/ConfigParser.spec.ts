import { describe, it, expect } from 'vitest'
import { validateClassConfig } from '../ConfigParser';
import { Groups, type ClassConfig } from '../ClassConfig';

describe('validateClassConfig', () => {
  it('captures duplicates names in the same row', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: ['bob'],
        group: 'yes',
        id: 'bob'
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 1;

    expect(res.length).toEqual(expectedErrors);
  });

  it('captures duplicates names in finalName', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: [],
        group: 'yes',
        id: 'bob1'
      }, {
        finalName: 'bob',
        potentialNames: [],
        group: 'yes',
        id: 'bob2'
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 1;

    expect(res.length).toEqual(expectedErrors);
  });

  it('captures duplicates across rows', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: [],
        group: 'yes',
        id: 'bob1'
      }, {
        finalName: 'sam',
        potentialNames: ['bob'],
        group: 'yes',
        id: 'bob2'
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 1;

    expect(res.length).toEqual(expectedErrors);
  });

  it('captures duplicates with id', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: [],
        group: 'yes',
        id: 'bob'
      }, {
        finalName: 'sam',
        potentialNames: [],
        group: 'yes',
        id: 'bob'
      }, {
        finalName: 'john',
        potentialNames: [],
        group: 'yes',
        id: 'bob'
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 2;

    expect(res.length).toEqual(expectedErrors);
  });

  it('captures that the group is Unknown', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: [],
        group: Groups.Unknown,
        id: 'bob'
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 1;

    expect(res.length).toEqual(expectedErrors);
  });

  it('each unique errors shows up multiple times', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: [],
        group: 'yes',
        id: 'bob'
      }, {
        finalName: 'bob',
        potentialNames: ['bob'],
        group: Groups.Unknown,
        id: 'bob'
      }
    ];
    const res = validateClassConfig(config);

    // 'bob' used across final and potential names
    // Unknwon group
    // Duplicate id 
    const expectedErrors = 3;

    expect(res.length).toEqual(expectedErrors);
  });

  it('id must be filled in', () => {
    const config: ClassConfig[] = [
      {
        finalName: 'bob',
        potentialNames: [],
        group: 'yes',
        id: ''
      }, {
        finalName: 'sam',
        potentialNames: [],
        group: 'yes',
        id: undefined as any as string,
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 2;

    expect(res.length).toEqual(expectedErrors);
  });

  it('final name must be filled in', () => {
    const config: ClassConfig[] = [
      {
        finalName: '',
        potentialNames: [],
        group: 'yes',
        id: 'bob1'
      }, {
        finalName: undefined as any as string,
        potentialNames: [],
        group: 'yes',
        id: 'bob2'
      }
    ];
    const res = validateClassConfig(config);

    const expectedErrors = 2;

    expect(res.length).toEqual(expectedErrors);
  });
});