
import { describe, it, expect, test } from 'vitest';
import { forumBreakoutTimes, translateConfigToNotifyTimings, type BreakoutRoomConfig } from '../BreakoutRoomTimes';


function testTheThing(input: { [key: string]: BreakoutRoomConfig[] }) {
  const keys = Object.keys(input);
  for (const k of keys) {
    describe(k, () => {
      for (const data of input[k] as BreakoutRoomConfig[]) {
        describe(`page ${data.page}`, () => {
          it('peopleSharing <= peoplePerRoom', () => {
            expect(data.peopleSharing).lessThanOrEqual(data.peoplePerRoom);
          });

          it('totalTotalTime > peopleSharing * timePerShare', () => {
            expect(data.totalTotalTime).greaterThanOrEqual(data.peopleSharing * data.timePerShare);
          })

          it('notifyAt < timePerShare', () => {
            expect(data.notifyAt).lessThan(data.timePerShare);
          })
        })
      }
    })
  }
}

describe('forumBreakoutTimes', () => {
  testTheThing(forumBreakoutTimes);
});

describe('translateConfigToNotifyTimings', () => {

  it('1 min buffer', () => {
    const input: Partial<BreakoutRoomConfig> = {
      peopleSharing: 3,
      totalTotalTime: 10,
      timePerShare: 3,
      notifyAt: 2.5
    };

    const expected = [
      '9:00',
      '6:00',
      '3:00',
    ];

    const res = translateConfigToNotifyTimings(input as BreakoutRoomConfig);
    expect(res).toStrictEqual(expected);
  });

  it('30s buffer', () => {
    const input: Partial<BreakoutRoomConfig> = {
      peopleSharing: 3,
      totalTotalTime: 8,
      timePerShare: 2.5,
      notifyAt: 2
    };

    const expected = [
      '7:15',
      '4:45',
      '2:15',
    ];

    const res = translateConfigToNotifyTimings(input as BreakoutRoomConfig);
    expect(res).toStrictEqual(expected);
  });

  it('people sharing != people in room', () => {
    const input: Partial<BreakoutRoomConfig> = {
      peopleSharing: 3,
      totalTotalTime: 7,
      timePerShare: 2,
      notifyAt: 1.5
    };

    const expected = [
      '6:00',
      '4:00',
      '2:00',
    ];

    const res = translateConfigToNotifyTimings(input as BreakoutRoomConfig);
    expect(res).toStrictEqual(expected);
  });

  it('six people sharing', () => {
    const input: Partial<BreakoutRoomConfig> = {
      peopleSharing: 6,
      totalTotalTime: 7,
      timePerShare: 1,
      notifyAt: .75
    };

    const expected = [
      '6:15',
      '5:15',
      '4:15',
      '3:15',
      '2:15',
      '1:15',
    ];

    const res = translateConfigToNotifyTimings(input as BreakoutRoomConfig);
    expect(res).toStrictEqual(expected);
  });
});