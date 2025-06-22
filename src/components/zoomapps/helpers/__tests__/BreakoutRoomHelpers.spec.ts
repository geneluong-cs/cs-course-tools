import { describe, it, expect } from 'vitest'
import { evenOutBreakoutRooms, type BreakoutRoomAction, type BreakoutRoomResolution } from '../BreakoutRoomHelpers';
import type { BreakoutRoomsResponse } from '@zoom/appssdk';

describe('evenOutBreakoutRooms', () => {
  it('already balanced and no unassigned', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            }
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            }
          ]
        },
        {
          breakoutRoomId: 'ghi',
          name: 'Room 3',
          participants: [
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
            {
              displayName: 'Sheep',
              participantId: 6,
              participantStatus: 'assigned',
              participantUUID: '6'
            }
          ]
        },
        {
          breakoutRoomId: 'jkl',
          name: 'Room 4',
          participants: [
            {
              displayName: 'John',
              participantId: 7,
              participantStatus: 'assigned',
              participantUUID: '7'
            },
            {
              displayName: 'Kane',
              participantId: 8,
              participantStatus: 'assigned',
              participantUUID: '8'
            }
          ]
        },
        {
          breakoutRoomId: 'mno',
          name: 'Room 5',
          participants: [
            {
              displayName: 'Butch',
              participantId: 9,
              participantStatus: 'assigned',
              participantUUID: '9'
            },
            {
              displayName: 'Lenny',
              participantId: 10,
              participantStatus: 'assigned',
              participantUUID: '10'
            }
          ]
        }


      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('moves a room with extra person into one that is one short, earlier to later', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            },
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            }
          ]
        },
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '1'
      }
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });


  it('moves a room with extra person into one that is one short, later to earlier', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            },
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            },
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
          ]
        },
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'abc',
        participantUuid: '4'
      }
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('can assign multiple participants to a room, fills fullest to least', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            }
          ]
        },
        {
          breakoutRoomId: 'ghi',
          name: 'Room 3',
          participants: [
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            },
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
            {
              displayName: 'Sheep',
              participantId: 6,
              participantStatus: 'assigned',
              participantUUID: '6'
            },
            {
              displayName: 'John',
              participantId: 7,
              participantStatus: 'assigned',
              participantUUID: '7'
            },
            {
              displayName: 'Kane',
              participantId: 8,
              participantStatus: 'assigned',
              participantUUID: '8'
            },
            {
              displayName: 'Butch',
              participantId: 9,
              participantStatus: 'assigned',
              participantUUID: '9'
            },
          ]
        },

      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '2'
      },
      {
        action: 'Add',
        borid: 'abc',
        participantUuid: '5',
      },
      {
        action: 'Add',
        borid: 'abc',
        participantUuid: '6'
      }
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 3);

    expect(res).toEqual(expected);
  });


  it('fills and reports when a room cant be fulfilled', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
          ]
        },
        {
          breakoutRoomId: 'ghi',
          name: 'Room 3',
          participants: [
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            },
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
            {
              displayName: 'Sheep',
              participantId: 6,
              participantStatus: 'assigned',
              participantUUID: '6'
            }
          ]
        },
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'abc',
        participantUuid: '4'
      },
      {
        action: 'UnderAllocated',
        borid: 'def',
        participantUuid: undefined
      }
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('can fill mulitple and report when a room cant be fulfilled', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
          ]
        },
        {
          breakoutRoomId: 'ghi',
          name: 'Room 3',
          participants: [
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
          ]
        },
        {
          breakoutRoomId: 'mno',
          name: 'Room 5',
          participants: [
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            },
            {
              displayName: 'Kane',
              participantId: 8,
              participantStatus: 'assigned',
              participantUUID: '8'
            },
            {
              displayName: 'Butch',
              participantId: 9,
              participantStatus: 'assigned',
              participantUUID: '9'
            },
            {
              displayName: 'Lenny',
              participantId: 10,
              participantStatus: 'assigned',
              participantUUID: '10'
            }
          ]
        }
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'abc',
        participantUuid: '4'
      },
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '8'
      },
      {
        action: 'UnderAllocated',
        borid: 'ghi',
        participantUuid: undefined
      },
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('can collapse a room', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
          ]
        },
        {
          breakoutRoomId: 'ghi',
          name: 'Room 3',
          participants: [
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
          ]
        },
        {
          breakoutRoomId: 'jkl',
          name: 'Room 4',
          participants: [
            {
              displayName: 'John',
              participantId: 7,
              participantStatus: 'assigned',
              participantUUID: '7'
            },
          ]
        },
        {
          breakoutRoomId: 'mno',
          name: 'Room 5',
          participants: [
            {
              displayName: 'Sheep',
              participantId: 6,
              participantStatus: 'assigned',
              participantUUID: '6'
            },
            {
              displayName: 'Kane',
              participantId: 8,
              participantStatus: 'assigned',
              participantUUID: '8'
            },
            {
              displayName: 'Butch',
              participantId: 9,
              participantStatus: 'assigned',
              participantUUID: '9'
            },
            {
              displayName: 'Lenny',
              participantId: 10,
              participantStatus: 'assigned',
              participantUUID: '10'
            }
          ]
        }


      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'abc',
        participantUuid: '6'
      },
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '8'
      },
      {
        action: 'Add',
        borid: 'ghi',
        participantUuid: '7'
      },
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('can split a room', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            },
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            }
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
          ]
        },
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '1'
      },
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '2'
      }

    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('can split a room multiple times', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            },
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            },
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
            {
              displayName: 'Sheep',
              participantId: 6,
              participantStatus: 'assigned',
              participantUUID: '6'
            }
          ]
        },
        {
          breakoutRoomId: 'def',
          name: 'Room 2',
          participants: [
          ]
        },
        {
          breakoutRoomId: 'ghi',
          name: 'Room 3',
          participants: [
          ]
        },
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '1'
      },
      {
        action: 'Add',
        borid: 'def',
        participantUuid: '2'
      },
      {
        action: 'Add',
        borid: 'ghi',
        participantUuid: '3'
      },
      {
        action: 'Add',
        borid: 'ghi',
        participantUuid: '4'
      }
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });

  it('can split a room and ask for extra rooms', () => {
    const response: Partial<BreakoutRoomsResponse> = {
      rooms: [
        {
          breakoutRoomId: 'abc',
          name: 'Room 1',
          participants: [
            {
              displayName: 'Bob',
              participantId: 1,
              participantStatus: 'assigned',
              participantUUID: '1'
            },
            {
              displayName: 'Jane',
              participantId: 2,
              participantStatus: 'assigned',
              participantUUID: '2'
            },
            {
              displayName: 'Scotty',
              participantId: 3,
              participantStatus: 'assigned',
              participantUUID: '3'
            },
            {
              displayName: 'Fox',
              participantId: 4,
              participantStatus: 'assigned',
              participantUUID: '4'
            },
            {
              displayName: 'Wolf',
              participantId: 5,
              participantStatus: 'assigned',
              participantUUID: '5'
            },
            {
              displayName: 'Sheep',
              participantId: 6,
              participantStatus: 'assigned',
              participantUUID: '6'
            }
          ]
        },
      ],
      unassigned: []
    };

    const expected: BreakoutRoomResolution[] = [
      {
        action: 'ExtraRoom',
        borid: '1',
        participantUuid: '1'
      },
      {
        action: 'ExtraRoom',
        borid: '1',
        participantUuid: '2'
      },
      {
        action: 'ExtraRoom',
        borid: '2',
        participantUuid: '3'
      },
      {
        action: 'ExtraRoom',
        borid: '2',
        participantUuid: '4'
      }
    ];

    const res = evenOutBreakoutRooms(response as BreakoutRoomsResponse, 2);

    expect(res).toEqual(expected);
  });


});