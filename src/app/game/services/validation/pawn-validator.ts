import {Coordinate} from "../../model/coordinate";
import {Field} from "../../model/field";
import {ValidationStrategy} from "./validation-strategy";
import {PieceColor} from "../../model/piece-color";
import {ValidationHelper} from "./validation-helper";
import {Move} from "../../model/move";
import {MoveType} from "../../model/move-type";
import {CheckDestination} from "../../model/check-destination";
import {PieceType} from "../../model/piece-type";

export class PawnValidator extends ValidationHelper implements ValidationStrategy {

  checkDestination(from: Coordinate, board: Field[][], moveHistory: Move[]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getPieceColor(from, board)!;
    const direction: number = this.getDirection(color);
    const checkDestination: CheckDestination = { from, color, board, direction };

    this.checkShortMove(checkDestination, toMap)
    this.checkLongMove(checkDestination, toMap);
    this.checkCapture(checkDestination, toMap);
    this.checkEnPassant(checkDestination, toMap, moveHistory);

    return toMap;
  }

  private checkShortMove(checkDestination: CheckDestination, map: Map<string, MoveType>) {
    const {from, color, board, direction} = checkDestination;
    const to = this.getToShortMove(from, direction!);

    if (this.isEmptyField(to, board)) {
      map.set(JSON.stringify(to), MoveType.REGULAR);
    }
  }

  private checkLongMove(checkDestination: CheckDestination, map: Map<string, MoveType>) {
    const {from, color, board, direction} = checkDestination;
    const prev = this.getToShortMove(from, direction!);
    const to = this.getToLongMove(from, direction!);

    if (this.isEmptyField(prev, board) && this.isEmptyField(to, board) && from.row === this.getStartRow(color!)) {
      map.set(JSON.stringify(to), MoveType.REGULAR);
    }
  }

  private getToShortMove(from: Coordinate, direction: number) {
    return { row: from.row + direction, column: from.column};
  }

  private getToLongMove(from: Coordinate, direction: number) {
    return { row: from.row + direction * 2, column: from.column};
  }

  private getDirection(color: PieceColor) {
    return color === PieceColor.WHITE ? -1 : 1;
  }

  private getStartRow(color: PieceColor) {
    return color === PieceColor.WHITE ? 6 : 1;
  }

  private checkCapture(checkDestination: CheckDestination, map: Map<string, MoveType>): Map<string, MoveType> {
    const {from, color, board, direction} = checkDestination;
    const toLeftDiagonal = this.getToLeftDiagonal(from, direction!)
    const toRightDiagonal = this.getToRightDiagonal(from, direction!)

    if (this.isOpponentPiece(toLeftDiagonal, board, color!)) {
      map.set(JSON.stringify(toLeftDiagonal), MoveType.CAPTURE)
    }
    if (this.isOpponentPiece(toRightDiagonal, board, color!)) {
      map.set(JSON.stringify(toRightDiagonal), MoveType.CAPTURE)
    }
    return map;
  }

  private isOpponentPiece(toLeftDiagonal: Coordinate, board: Field[][], color: PieceColor) {
    return !!this.getPiece(toLeftDiagonal, board) && this.getPieceColor(toLeftDiagonal, board) !== color;
  }

  private getToLeftDiagonal(from: Coordinate, direction: number): Coordinate {
    return { row: from.row + direction, column: from.column + direction};
  }

  private getToRightDiagonal(from: Coordinate, direction: number): Coordinate {
    return { row: from.row + direction, column: from.column - direction};
  }

  private checkEnPassant(checkDestination: CheckDestination, map: Map<string, MoveType>, moveHistory: Move[]): Map<string, MoveType> {
    const { from, direction} = checkDestination;
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      const toLeftDiagonal = this.getToLeftDiagonal(from, direction!)
      const toRightDiagonal = this.getToRightDiagonal(from, direction!)

      if (this.isEnPassant(checkDestination, toLeftDiagonal, lastMove)) {
        map.set(JSON.stringify(toLeftDiagonal), MoveType.EN_PASSANT);
      }
      if (this.isEnPassant(checkDestination, toRightDiagonal, lastMove)) {
        map.set(JSON.stringify(toRightDiagonal), MoveType.EN_PASSANT);
      }
    }
    return map;
  }

  private isEnPassant(checkDestination: CheckDestination, to: Coordinate, lastMove: Move) {
    const { from, color, board, direction} = checkDestination;
    return lastMove.from.row - lastMove.to.row === 2 * direction!
      && this.isEmptyField({ row: to.row, column: to.column }, board)
      && lastMove.piece.type === PieceType.PAWN
      && lastMove.piece.color !== color
      && lastMove.to.column === to.column
      && lastMove.to.row === from.row;
  }
}
