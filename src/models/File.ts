export interface File {
    name: string;
    cleanName: string;
    downloadURL: string;
    drillZones?: {
        x: number;
        y: number;
        z: number;
        radius: number;
    }[];
}