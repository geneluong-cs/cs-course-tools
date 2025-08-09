import { DateTime } from "luxon";

export function createLog(msg: any, logtype: LogType): RichLog {
  return {
    time: DateTime.now(),
    logType: logtype,
    msg: msg
  }

}
export interface RichLog {
  time: DateTime;
  logType: LogType;
  msg: any;
}

export type LogType = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';