import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";

export interface ValidationStrategy {

  // validateMove(from: Coordinate, to: Coordinate, board: Field[][]): MoveType;

  checkDestination(from: Coordinate, board: Field[][]): Map<string, MoveType>;
}
