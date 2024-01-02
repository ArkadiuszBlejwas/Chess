import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {PieceColor} from "../model/piece-color";
import {Piece} from "../model/piece";

export abstract class ValidationHelper {

  getPiece(coordinate: Coordinate, board: Field[][]): Piece | undefined {
    if (this.isValidCoordinate(coordinate)) {
      return board[coordinate.row][coordinate.column].piece;
    }
    return;
  }

  isValidCoordinate(coordinate: Coordinate): boolean {
    const size = [0, 1, 2, 3, 4, 5, 6, 7];
    return size.includes(coordinate.row) && size.includes(coordinate.column);
  }

  isEmptyField(row: number, column: number, board: Field[][]): boolean {
    return this.isValidCoordinate({row, column}) && !this.getPiece({row, column}, board);
  }

  isEmptyField2(coordinate: Coordinate, board: Field[][]): boolean {
    return this.isValidCoordinate(coordinate) && !this.getPiece(coordinate, board);
  }

  getPieceColor(from: Coordinate, board: Field[][]): PieceColor | undefined {
    if (this.isValidCoordinate(from)) {
      return this.getPiece(from, board)?.color;
    }
    return;
  }

  getOpponentColor(from: Coordinate, board: Field[][]): PieceColor {
    return this.getPieceColor(from, board) === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }

  getDistanceRow(from: Coordinate, to: Coordinate): number {
    return from.row - to.row;
  }
}
