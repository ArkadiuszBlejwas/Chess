import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {ValidationStrategy} from "./validation-strategy";
import {PieceColor} from "../model/piece-color";
import {ValidationHelper} from "./validation-helper";
import {ValidatedMove} from "../model/validated-move";
import {Move} from "../model/move";
import {PieceType} from "../model/piece-type";
import {inject} from "@angular/core";
import {BoardService} from "../../services/board.service";
import {MoveType} from "../model/move-type";

export class PawnValidator extends ValidationHelper implements ValidationStrategy {

  history!: Move[];

  boardService = inject(BoardService);

  constructor() {
    super();
    this.boardService.getHistoryOfMoves()
      .subscribe(history => this.history = history);
  }

  validateMove(from: Coordinate, to: Coordinate, board: Field[][]): MoveType {
    const color: PieceColor = this.getPieceColor(from, board)!;
    const direction: number = this.getDirection(color);
    const move: ValidatedMove = { from, to, color, board };

    return this.getMoveType(move, direction);
  }

  private getMoveType(move: ValidatedMove, direction: number): MoveType {
    switch (true) {
      case this.isLongMove(move, direction):
      case this.isShortMove(move, direction):
        return MoveType.REGULAR;

      case this.isCapture(move, direction):
        return MoveType.CAPTURE;

      case this.isEnPassant(move, direction):
        return MoveType.EN_PASSANT;

      default:
        return MoveType.INVALID;
    }
  }

  private isLongMove(move: ValidatedMove, direction: number): boolean {
    const {from, to, color, board} = move;

    return from.column === to.column
      && this.getStartRow(color) === from.row
      && this.getDistanceRow(from, to) === 2 * direction
      && this.isEmptyField(to.row, to.column, board)
      && this.isEmptyField(from.row - direction, from.column, board);
  }

  private isShortMove(move: ValidatedMove, direction: number): boolean {
    const {from, to, board} = move;

    return from.column === to.column
      && this.getDistanceRow(from, to) === direction
      && this.isEmptyField(to.row, to.column, board);
  }

  private isDiagonal(move: ValidatedMove, direction: number) {
    const { from, to} = move;

    return this.getDistanceRow(from, to) === direction
      && Math.abs(this.getDistanceColumn(from, to)) === 1;
  }

  private isCapture(move: ValidatedMove, direction: number) {
    const { to, color, board} = move;

    return this.isDiagonal(move, direction)
      && !!this.getPiece(to, board) && this.getPieceColor(to, board) !== color;
  }

  private isEnPassant(move: ValidatedMove, direction: number) {
    const {from, to, color, board} = move;
    if (this.isDiagonal(move, direction) && this.history.length > 1) {
      const lastMove: Move = this.history[this.history.length - 1];

      return this.getDistanceRow(lastMove.from, lastMove.to) === -2 * direction
        && this.isEmptyField(move.to.row, move.to.column, board)
        && lastMove.piece.type === PieceType.PAWN
        && lastMove.piece.color !== color
        && lastMove.to.column === to.column
        && lastMove.to.row === from.row;
    }
    return false;
  }

  private getStartRow(color: PieceColor) {
    return color === PieceColor.WHITE ? 6 : 1;
  }
}
