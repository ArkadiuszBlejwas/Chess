import {Coordinate} from "./coordinate";
import {PieceColor} from "./piece-color";
import {Field} from "./field";

export interface CheckDestination {
  from: Coordinate;
  color?: PieceColor;
  board: Field[][];
  direction?: number;
}
