
export interface ClassConfig {
  id: string;
  finalName: string;
  potentialNames: string[];
  group: string;
}

export interface ClassStatus extends ClassConfig {
  here: boolean;
  participantUuid: string | undefined;
}

export const Groups = {
  Unknown: 'Unknown',
  Participant: 'Participant',
  Assisting: 'Assisting',
};