import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {ValidationStrategy} from "./validation-strategy";
import {PieceColor} from "../model/piece-color";
import {ValidationHelper} from "./validation-helper";
import {Move} from "../model/move";
import {inject} from "@angular/core";
import {BoardService} from "../../services/board.service";
import {MoveType} from "../model/move-type";
import {CheckTarget} from "../model/check-target";
import {PieceType} from "../model/piece-type";

export class PawnValidator extends ValidationHelper implements ValidationStrategy {

  lastMove?: Move;

  boardService = inject(BoardService);

  constructor() {
    super();
    this.boardService.getLastMove()
      .subscribe(lastMove => this.lastMove = lastMove);
  }

  checkDestination(from: Coordinate, board: Field[][]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getPieceColor(from, board)!;
    const direction: number = this.getDirection(color);
    const target: CheckTarget = { from, color, board, direction };

    this.checkShortMove(target, toMap)
    this.checkLongMove(target, toMap);
    this.checkCapture(target, toMap);
    this.checkEnPassant(target, toMap);

    return toMap;
  }

  private checkShortMove(target: CheckTarget, map: Map<string, MoveType>) {
    const {from, color, board, direction} = target;
    const to = this.getToShortMove(from, direction!);

    if (this.isEmptyField2(to, board)) {
      map.set(JSON.stringify(to), MoveType.REGULAR);
    }
  }

  private checkLongMove(target: CheckTarget, map: Map<string, MoveType>) {
    const {from, color, board, direction} = target;
    const prev = this.getToShortMove(from, direction!);
    const to = this.getToLongMove(from, direction!);

    if (this.isEmptyField2(prev, board) && this.isEmptyField2(to, board) && from.row === this.getStartRow(color!)) {
      map.set(JSON.stringify(to), MoveType.REGULAR);
    }
  }

  private getToShortMove(from: Coordinate, direction: number) {
    return {row: from.row + direction, column: from.column};
  }

  private getToLongMove(from: Coordinate, direction: number) {
    return {row: from.row + direction * 2, column: from.column};
  }

  private getDirection(color: PieceColor) {
    return color === PieceColor.WHITE ? -1 : 1;
  }

  private getStartRow(color: PieceColor) {
    return color === PieceColor.WHITE ? 6 : 1;
  }

  private checkCapture(target: CheckTarget, map: Map<string, MoveType>): Map<string, MoveType> {
    const {from, color, board, direction} = target;
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
    return {row: from.row + direction, column: from.column + direction};
  }

  private getToRightDiagonal(from: Coordinate, direction: number): Coordinate {
    return {row: from.row + direction, column: from.column - direction};
  }

  private checkEnPassant(target: CheckTarget, map: Map<string, MoveType>): Map<string, MoveType> {
    const {from, direction} = target;
    if (!!this.lastMove) {
      const toLeftDiagonal = this.getToLeftDiagonal(from, direction!)
      const toRightDiagonal = this.getToRightDiagonal(from, direction!)

      if (this.isEnPassant(target, toLeftDiagonal, this.lastMove)) {
        map.set(JSON.stringify(toLeftDiagonal), MoveType.EN_PASSANT);
      }
      if (this.isEnPassant(target, toRightDiagonal, this.lastMove)) {
        map.set(JSON.stringify(toRightDiagonal), MoveType.EN_PASSANT);
      }
    }
    return map;
  }

  private isEnPassant(target: CheckTarget, to: Coordinate, lastMove: Move) {
    const {from, color, board, direction} = target;
    return this.getDistanceRow(lastMove.from, lastMove.to) === 2 * direction!
      && this.isEmptyField(to.row, to.column, board)
      && lastMove.piece.type === PieceType.PAWN
      && lastMove.piece.color !== color
      && lastMove.to.column === to.column
      && lastMove.to.row === from.row;
  }
}
