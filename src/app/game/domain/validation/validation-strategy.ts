import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";

export interface ValidationStrategy {

  checkTarget(from: Coordinate, board: Field[][]): Map<string, MoveType>;
}
