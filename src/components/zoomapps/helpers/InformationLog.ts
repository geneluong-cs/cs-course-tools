import type { DateTime } from "luxon";

export interface InformationLog {
  timestamp: DateTime;
  class: string;

  message: string;
}
