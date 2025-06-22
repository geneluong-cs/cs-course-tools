import type { BreakoutRoomsResponse } from "@zoom/appssdk";

export function evenOutBreakoutRooms(response: BreakoutRoomsResponse, targetSize: number): BreakoutRoomResolution[] {

  const reversedRooms = response.rooms.slice();
  reversedRooms.reverse();
  const extraParticipants = reversedRooms.flatMap(r => {
    if (r.participants && r.participants.length > targetSize) {
      return r.participants.slice(0, r.participants.length - targetSize).map(x => x.participantUUID);
    } else {
      return [];
    }
  });

  const runningRoomCounts = response.rooms.filter(r => {
    return r.participants && r.participants.length >= 0 && r.participants.length < targetSize
  }).map(r => {
    return new BorTracker(
      r.breakoutRoomId,
      r.participants?.map(x => x.participantUUID)
    );
  });


  // Descending by count so we fill nearly full rooms first
  runningRoomCounts.sort((a, b) => b.count() - a.count());

  const extraRooms: BorTracker[] = []

  const results = new Array<BreakoutRoomResolution>();

  // Sort overflows
  for (const participant of extraParticipants) {
    if (runningRoomCounts.length > 0) {
      const firstRoomIndex = runningRoomCounts.findIndex(x => x.count() < targetSize);

      // Add to a room that can fit it
      if (firstRoomIndex >= 0) {
        const firstRoom = runningRoomCounts[firstRoomIndex];

        results.push({
          action: 'Add',
          borid: firstRoom.borid,
          participantUuid: participant
        });

        firstRoom.add(participant);
        // Remove from consideration when it reaches target
        if (firstRoom.count() >= targetSize) {
          runningRoomCounts.splice(firstRoomIndex, 1);
        }
      }
    }
    else {
      const firstRoomIndex = extraRooms.findIndex(x => x.count() < targetSize);
      // Add to extra room, these are rooms that have been explictly added
      if (firstRoomIndex >= 0) {
        const firstRoom = extraRooms[firstRoomIndex];

        results.push({
          action: 'ExtraRoom',
          borid: firstRoom.borid,
          participantUuid: participant
        });

        firstRoom.add(participant);
        // No need to remove it, only free rooms are considered
        // The total length needs to be preserved to tracked the room name
      } else {
        const newRoom = new BorTracker(
          (extraRooms.length + 1).toString(),
          [participant]
        );

        results.push({
          action: 'ExtraRoom',
          borid: newRoom.borid,
          participantUuid: participant
        });

        extraRooms.push(newRoom);
      }
    }
  }

  const jaggedRoomCounts = runningRoomCounts.filter(x => x.count() > 0 && x.count() < targetSize);
  while (jaggedRoomCounts.length > 0) {
    const lastRoom = jaggedRoomCounts.at(-1) as BorTracker;
    const firstRoom = jaggedRoomCounts.at(0) as BorTracker;

    if (firstRoom === lastRoom) {
      // Left overs
      results.push({
        action: "UnderAllocated",
        borid: lastRoom.borid,
        participantUuid: undefined,
      });
      jaggedRoomCounts.pop();
    } else {

      const moveThisParticipant = lastRoom.participantUuid.shift();
      results.push({
        action: 'Add',
        borid: firstRoom.borid,
        participantUuid: moveThisParticipant,
      });
      firstRoom.add(moveThisParticipant as string);

      if (firstRoom.count() >= targetSize) {
        jaggedRoomCounts.shift();
      }

      if (lastRoom.count() === 0) {
        jaggedRoomCounts.pop();
      }
    }
  }

  return results;
}


export type BreakoutRoomAction = 'Add' | 'UnderAllocated' | 'ExtraRoom';

export interface BreakoutRoomResolution {
  action: BreakoutRoomAction;
  borid: string;
  participantUuid: string | undefined;
}

class BorTracker {
  constructor(borid: string, participantUuid: string[] = []) {
    this.borid = borid;
    this.participantUuid = participantUuid;
  }

  borid: string;
  participantUuid: string[];
  count(): number { return this.participantUuid.length; }

  add(uuid: string): void {
    this.participantUuid.push(uuid);
  }
}