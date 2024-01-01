import {Coordinate} from "./coordinate";
import {PieceColor} from "./piece-color";
import {Field} from "./field";

export interface ValidatedMove {
  from: Coordinate;
  to: Coordinate;
  color: PieceColor;
  board: Field[][];
}
