import {Coordinate} from "./coordinate";
import {Piece} from "./piece";
import {MoveType} from "./move-type";

export interface Move {
  from: Coordinate;
  to: Coordinate;
  piece: Piece;
  moveType?: MoveType;
}
