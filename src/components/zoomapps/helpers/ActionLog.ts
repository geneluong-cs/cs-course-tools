import type { InformationLog } from "./InformationLog";

export interface ActionLog extends InformationLog {
    action: () => Promise<any>;
}
