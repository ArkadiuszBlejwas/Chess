import {PieceType} from "./piece-type";
import {PieceColor} from "./piece-color";

export interface Piece {
  type: PieceType;
  color: PieceColor;
}
