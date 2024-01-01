import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {PieceColor} from "../model/piece-color";
import {ValidationHelper} from "./validation-helper";
import {ValidatedMove} from "../model/validated-move";

export class InitialValidator extends ValidationHelper {

  validateInitial(move: ValidatedMove) {
    const {from, to, board, color} = move;
    return this.areCoordinatesOnBoard(from, to, board)
      && this.hasFromMyPiece(from, board, color)
      && this.hasNotToMyPiece(to, board, color)
      && this.isNotFromEqualTo(from, to);
  }

  private hasFromMyPiece(from: Coordinate, board: Field[][], color: PieceColor) {
    return this.getPieceColor(from, board) === color;
  }

  private hasNotToMyPiece(to: Coordinate, board: Field[][], color: PieceColor) {
    return this.getPieceColor(to, board) !== color;
  }

  private isNotFromEqualTo(from: Coordinate, to: Coordinate) {
    return from !== to;
  }

  private areCoordinatesOnBoard(from: Coordinate, to: Coordinate, board: Field[][]) {
    const sideBoard = [0, 1, 2, 3, 4, 5, 6, 7];
    return sideBoard.includes(from.row) && sideBoard.includes(from.column)
      && sideBoard.includes(to.row) && sideBoard.includes(to.column);
  }
}
