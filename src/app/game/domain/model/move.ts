import {Coordinate} from "./coordinate";
import {Piece} from "./piece";

export interface Move {
  from: Coordinate;
  to: Coordinate;
  piece: Piece;
}
