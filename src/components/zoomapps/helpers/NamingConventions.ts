
export function getNewRoomName(index: number): string {
  switch (index) {
    case 0:
      return 'Leader Room';
    default:
      return `Group ${index.toString().padStart(2, '0')}`;
  }
}

export function getFirstWord(name: string): string {
  const index = name.indexOf(' ');
  if (index < 0) {
    return name;
  } else {
    return name.substring(0, index);
  }
}

export function getGroupNumber(name: string): number {
  const first = getFirstWord(name);
  const reg = /(\d+)/;

  const res = first.match(reg);

  if (res === null) {
    return Number.NaN
  } else {
    return parseInt(res[0]);
  }
}

export function getSecondWord(name: string): string {
  const index = name.indexOf(' ');
  if (index < 0) {
    return name;
  } else {
    return name.substring(index + 1);
  }
}

export function getNames(screenName: string): [string, string | null] {
  const secondWord = getSecondWord(screenName);
  const splits = secondWord.split('/');
  switch (splits.length) {
    case 1:
      return [(splits[0] as string).trim(), null];
    case 2:
      return [(splits[0] as string).trim(), (splits[1] as string).trim()];
    default:
      return [secondWord, null];
  }
}

export function identifyAccountability(screenName: string): Accountability {
  const firstWord = getFirstWord(screenName);
  const firstChar = screenName.substring(0, 1);
  switch (firstChar) {
    case '*':
      if (firstWord.length === 1) {
        return 'participant-no-guest';
      } else {
        return 'participant-with-guest';
      }
    case '^':
      return 'graduate-guest';
    case '#':
    case '%':
    case '&':
      return 'pwa';
  }
  if (isNaN(Number(firstWord))) {
    return 'unknown';
  } else {
    return 'guest';
  }
}

export function identifyRoomNumber(screenName: string): number | null {
  const firstWord = getFirstWord(screenName);
  const match = /^\D?(\d+)/.exec(firstWord);
  if (match === null) {
    return null;
  } else if (match.length === 1) {
    return null;
  } else {
    return Number(match.at(1));
  }
}

type Accountability =
  | 'participant-with-guest'
  | 'participant-no-guest'
  | 'graduate-guest'
  | 'pwa'
  | 'guest'
  | 'unknown';