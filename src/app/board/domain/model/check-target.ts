import {Coordinate} from "./coordinate";
import {PieceColor} from "./piece-color";
import {Field} from "./field";

export interface CheckTarget {
  from: Coordinate;
  color?: PieceColor;
  board: Field[][];
  direction?: number;
}
