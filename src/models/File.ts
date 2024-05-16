export interface File {
    name: string;
    downloadURL: string;
    drillZones?: {
        x: number;
        y: number;
        z: number;
        radius: number;
    }[];
}