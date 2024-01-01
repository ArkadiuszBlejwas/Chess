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
    return !this.getPiece({row, column}, board);
  }

  isEmptyField2(coordinate: Coordinate, board: Field[][]): boolean {
    return !this.getPiece(coordinate, board);
  }

  getPieceColor(from: Coordinate, board: Field[][]): PieceColor | undefined {
    return this.getPiece(from, board)?.color;
  }

  getDistanceRow(from: Coordinate, to: Coordinate): number {
    return from.row - to.row;
  }

  getDistanceColumn(from: Coordinate, to: Coordinate): number {
    return from.column - to.column;
  }

  getDirectionColumn(from: Coordinate, to: Coordinate): number {
    return from.column - to.column < 0 ? 1 : -1;
  }

  getDirectionRow(from: Coordinate, to: Coordinate): number {
    return from.row - to.row < 0 ? 1 : -1;
  }

  isRegularMove(to: Coordinate, board: Field[][]): boolean {
    return this.isEmptyField(to.row, to.column, board);
  }

  isCaptureMove(from:Coordinate, to: Coordinate, board: Field[][]) {
    return this.getPieceColor(from, board) !== this.getPieceColor(to, board);
  }

  isDiagonalMove(from: Coordinate, to: Coordinate, board: Field[][]) {
    return Math.abs(this.getDistanceRow(from, to)) === Math.abs(this.getDistanceColumn(from, to))
      && this.areDiagonalEmptyFields(from, to, board);
  }

  isVerticalMove(from: Coordinate, to: Coordinate, board: Field[][]) {
    return this.getDistanceColumn(from, to) === 0
      && this.getDistanceRow(from, to) !== 0
      && this.areVerticalEmptyFields(from, to, board);
  }

  isHorizontalMove(from: Coordinate, to: Coordinate, board: Field[][]) {
    return this.getDistanceColumn(from, to) !== 0
      && this.getDistanceRow(from, to) === 0
      && this.areHorizontalEmptyFields(from, to, board)
  }

  areDiagonalEmptyFields(from: Coordinate, to: Coordinate, board: Field[][]) {
    const directionColumn: number = this.getDirectionColumn(from, to);
    const directionRow: number = this.getDirectionRow(from, to);
    let startColumn: number = from.column + directionColumn;
    let startRow: number = from.row + directionRow;

    while (startColumn !== to.column && startRow !== to.row) {
      if (!this.isEmptyField(startRow, startColumn, board)) {
        return false;
      }
      startColumn += directionColumn;
      startRow += directionRow;
    }
    return true;
  }

  areVerticalEmptyFields(from: Coordinate, to: Coordinate, board: Field[][]) {
    const directionRow: number = this.getDirectionRow(from, to);

    for (let startRow = from.row + directionRow; startRow != to.row; startRow += directionRow) {
      if (!this.isEmptyField(startRow, from.column, board)) {
        return false;
      }
    }
    return true;
  }

  areHorizontalEmptyFields(from: Coordinate, to: Coordinate, board: Field[][]) {
    const directionColumn: number = this.getDirectionColumn(from, to);

    for (let startColumn = from.column + directionColumn; startColumn != to.column; startColumn += directionColumn) {
      if (!this.isEmptyField(from.row, startColumn, board)) {
        return false;
      }
    }
    return true;
  }
}
