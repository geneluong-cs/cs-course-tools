

export function translateConfigToNotifyTimings(config: BreakoutRoomConfig): string[] {
  const bufferTime = (config.totalTotalTime - (config.peopleSharing * config.timePerShare)) / 2;

  return [...Array(config.peopleSharing).keys()]
    .map(i => bufferTime + config.notifyAt + i * config.timePerShare)
    .reverse()
    .map(x => `${Math.floor(x)}:${(60 * (x % 1)).toString().padStart(2, '0')}`)
}

export const forumBreakoutTimes: { [key: string]: BreakoutRoomConfig[] } = {
  'D1S1': [
    {
      page: 10,
      description: 'share where you have been inauthentic',
      peoplePerRoom: 3,
      peopleSharing: 3,
      totalTotalTime: 11,
      timePerShare: 3,
      notifyAt: 2.5
    },
    {
      page: 20,
      description: 'this is another share',
      peoplePerRoom: 2,
      peopleSharing: 2,
      totalTotalTime: 5,
      timePerShare: 2,
      notifyAt: 1.5
    }
  ]
}



export interface BreakoutRoomConfig {
  page: number;
  description: string;
  peoplePerRoom: number;
  peopleSharing: number; // Needs to be <= peoplePerRoom
  totalTotalTime: number; // Needs to be > peopleSharing * timePerShare. This is the time written in the manual and set in zoom
  timePerShare: number;
  notifyAt: number; // Needs to be < timePerShare
};