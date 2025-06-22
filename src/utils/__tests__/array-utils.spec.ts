import { describe, it, expect } from 'vitest'
import { flatten, groupBy, toWindows } from '../array-utils';
import { distinct } from '../array-utils';

describe('groupBy', () => {
  it('groups by key specified', () => {
    const input = [
      {
        color: 'blue',
        num: 1
      },
      {
        color: 'blue',
        num: 2
      },
      {
        color: 'red',
        num: 3
      },
    ];

    const expected = {
      'blue': [
        {
          color: 'blue',
          num: 1
        },
        {
          color: 'blue',
          num: 2
        },
      ],
      'red': [
        {
          color: 'red',
          num: 3
        },
      ]
    }

    const res = groupBy(input, 'color');

    expect(res).toEqual(expected);
  });
});

describe('toWindows', () => {
  it('creates sliding window by size input', () => {
    const input = [
      1,
      2,
      3,
      4,
      5,
    ];

    const expected = [
      [1,2,3],
      [2,3,4],
      [3,4,5],
    ]

    const res = toWindows(input, 3);

    expect(res).toEqual(expected);
  });
});

describe('distinct', () => {
  it('distincts on property selector specified', () => {
    const input = [
      {
        color: 'blue',
        num: 1
      },
      {
        color: 'blue',
        num: 2
      },
      {
        color: 'red',
        num: 3
      },
    ];

    const expected = [
      {
        color: 'blue',
        num: 1
      },
      {
        color: 'red',
        num: 3
      },
    ]

    const res = distinct(input, x => x.color);

    expect(res).toEqual(expected);
  });
});


describe('distinct', () => {
  it('distincts on property selector specified', () => {
    const input = [
      {
        color: 'blue',
        num: 1
      },
      {
        color: 'blue',
        num: 2
      },
      {
        color: 'red',
        num: 3
      },
    ];

    const expected = [
      {
        color: 'blue',
        num: 1
      },
      {
        color: 'red',
        num: 3
      },
    ]

    const res = distinct(input, x => x.color);

    expect(res).toEqual(expected);
  });
});

describe('flatten', () => {
  it('flattens things', () => {
    const input = [
      [1,2,3],
      [4,5,6],
    ];

    const expected = [
      1,2,3,4,5,6
    ];

    const res = flatten(input);

    expect(res).toEqual(expected);
  });

  it('does nothing with empty list', () => {
    const input: any[][] = [];
    const expected: any[] = [];

    const res = flatten(input);

    expect(res).toEqual(expected);
  });
});