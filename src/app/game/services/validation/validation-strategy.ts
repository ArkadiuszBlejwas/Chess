import {Coordinate} from "../../model/coordinate";
import {Field} from "../../model/field";
import {MoveType} from "../../model/move-type";
import {Move} from "../../model/move";

export interface ValidationStrategy {

  checkDestination(from: Coordinate, board: Field[][], moveHistory?: Move[]): Map<string, MoveType>;
}
