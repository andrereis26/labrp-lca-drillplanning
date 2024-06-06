import { Coords } from "./Coords";
import { Rotation } from "./Rotation";

export interface DrillZone{
    rotation: Rotation,
    position: Coords,
    height: number,
    radius: number;
}

