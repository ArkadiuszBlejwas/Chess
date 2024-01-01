import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";
import {Move} from "../model/move";
import {inject} from "@angular/core";
import {BoardService} from "../../services/board.service";
import {PieceType} from "../model/piece-type";
import {Piece} from "../model/piece";

export class KingValidator extends ValidationHelper implements ValidationStrategy {

  history!: Move[];

  boardService = inject(BoardService);

  constructor() {
    super();
    this.boardService.getHistoryOfMoves()
      .subscribe(history => this.history = history);
  }

  validateMove(from: Coordinate, to: Coordinate, board: Field[][]): MoveType {
    if (this.isShortMove(from, to)) {
      if (this.isRegularMove(to, board)) {
        return MoveType.REGULAR;
      }
      if (this.isCaptureMove(from, to, board)) {
        return MoveType.CAPTURE;
      }
    }
    if (this.isCastling(from, to, board)) {
      return MoveType.CASTLING;
    }
    return MoveType.INVALID;
  }

  private isShortMove(from: Coordinate, to: Coordinate) {
    return Math.abs(this.getDistanceRow(from, to)) <= 1 && Math.abs(this.getDistanceColumn(from, to)) <= 1;
  }

  private isCastling(from: Coordinate, to: Coordinate, board: Field[][]) {
    return this.isHorizontalMove(from, to, board)
      && this.areKingWithoutMove(from, board)
      && this.areRookWithoutMove(from, to, board);
  }

  private areKingWithoutMove(from: Coordinate, board: Field[][]) {
    const king: Piece | undefined = this.getPiece(from, board);
    return !this.history.find(move => this.isSamePiece(move, king!));
  }

  private areRookWithoutMove(from: Coordinate, to: Coordinate, board: Field[][]) {
    const kingColor = this.getPieceColor(from, board);
    const distanceColumn = this.getDistanceColumn(from, to);

    if (distanceColumn === -2 || distanceColumn === 2) {
      const column: number = to.column - this.getHorizontalDirection(distanceColumn);
      const coordinate: Coordinate = {row: to.row, column: column};
      const piece: Piece | undefined = this.getPiece(coordinate, board)

      return piece?.type === PieceType.ROOK && piece.color === kingColor
        && !this.history.find(move => this.isSamePiece(move, piece!) && this.isSameCoordinate(move, coordinate));
    }
    return false;
  }

  private getHorizontalDirection(distanceColumn: number) {
    return distanceColumn > 0 ? 2 : -1;
  }

  private isSamePiece(move: Move, piece: Piece) {
    return move.piece.color === piece?.color && move.piece.type === piece?.type;
  }

  private isSameCoordinate(move: Move, coordinate: Coordinate) {
    return move.from.row === coordinate.row && move.from.column === coordinate.column;
  }
}
