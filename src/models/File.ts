import { DrillZone } from "./DrillZone";

export interface File {
    name: string;
    cleanName: string;
    downloadURL: string;
    drillZones?: DrillZone[];
}

