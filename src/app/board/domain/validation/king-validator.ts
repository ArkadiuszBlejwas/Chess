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
import {PieceColor} from "../model/piece-color";
import {CheckTarget} from "../model/check-target";

export class KingValidator extends ValidationHelper implements ValidationStrategy {

  history!: Move[];

  boardService = inject(BoardService);

  constructor() {
    super();
    this.boardService.getHistoryOfMoves()
      .subscribe(history => this.history = history);
  }

  checkDestination(from: Coordinate, board: Field[][]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getOpponentColor(from, board)!;
    const target: CheckTarget = {from, board, color};

    this.checkRegularAndCapture(target, toMap);
    this.checkShortCastling(target, toMap);
    this.checkLongCastling(target, toMap);

    return toMap;
  }

  private checkRegularAndCapture(target: CheckTarget, toMap: Map<string, MoveType>) {
    const {from, board, color} = target;

    const topCoordinate: Coordinate = {row: from.row - 1, column: from.column};
    const bottomCoordinate: Coordinate = {row: from.row + 1, column: from.column};
    const leftCoordinate: Coordinate = {row: from.row, column: from.column - 1};
    const rightCoordinate: Coordinate = {row: from.row, column: from.column + 1};
    const leftTopCoordinate: Coordinate = {row: from.row - 1, column: from.column - 1};
    const rightTopCoordinate: Coordinate = {row: from.row - 1, column: from.column + 1};
    const leftBottomCoordinate: Coordinate = {row: from.row + 1, column: from.column - 1};
    const rightBottomCoordinate: Coordinate = {row: from.row + 1, column: from.column + 1};

    const coordinates = [
      leftTopCoordinate,
      rightTopCoordinate,
      leftBottomCoordinate,
      rightBottomCoordinate,
      leftCoordinate,
      rightCoordinate,
      topCoordinate,
      bottomCoordinate
    ];

    coordinates.forEach(coordinate => this.validateCoordinate(coordinate, board, color!, toMap));
  }

  private validateCoordinate(leftTopCoordinate: Coordinate, board: Field[][], color: PieceColor, toMap: Map<string, MoveType>) {
    if (this.isEmptyField2(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.REGULAR);
    }
    if (color === this.getPieceColor(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.CAPTURE);
    }
  }

  private checkShortCastling(target: CheckTarget, toMap: Map<string, MoveType>) {
    const {from, board} = target;
    const to = {row: from.row, column: from.column + 2};
    const areEmptyFields = this.getAreEmptyFieldsForShortCastling(from, board);

    if (areEmptyFields && this.isKingWithoutMove(from, board) && this.isRookWithoutMove(from, to, board)) {
      toMap.set(JSON.stringify(to), MoveType.CASTLING);
    }
  }

  private checkLongCastling(target: CheckTarget, toMap: Map<string, MoveType>) {
    const {from, board} = target;
    const to = {row: from.row, column: from.column - 2};
    const areEmptyFields = this.getAreEmptyFieldsForLongCastling(from, board);

    if (areEmptyFields && this.isKingWithoutMove(from, board) && this.isRookWithoutMove(from, to, board)) {
      toMap.set(JSON.stringify(to), MoveType.CASTLING);
    }
  }

  private getAreEmptyFieldsForShortCastling(from: Coordinate, board: Field[][]) {
    return this.isEmptyField(from.row, from.column + 1, board)
      && this.isEmptyField(from.row, from.column + 2, board);
  }

  private getAreEmptyFieldsForLongCastling(from: Coordinate, board: Field[][]) {
    return this.isEmptyField(from.row, from.column - 1, board)
      && this.isEmptyField(from.row, from.column - 2, board)
      && this.isEmptyField(from.row, from.column - 3, board);
  }

  private isKingWithoutMove(from: Coordinate, board: Field[][]) {
    const king: Piece | undefined = this.getPiece(from, board);
    return this.hasKingNoHistory(king);
  }

  private isRookWithoutMove(from: Coordinate, to: Coordinate, board: Field[][]) {
    const kingColor = this.getPieceColor(from, board);

    const column = this.getRookColumn(to);
    const coordinate: Coordinate = {row: to.row, column: column};
    const piece: Piece | undefined = this.getPiece(coordinate, board)

    return this.isRook(piece)
      && this.hasRookProperColor(piece, kingColor)
      && this.hasRookNoHistory(piece, coordinate);
  }

  private hasKingNoHistory(king: Piece | undefined) {
    return !this.history.find(move => this.isSamePiece(move, king!));
  }

  private hasRookNoHistory(piece: Piece | undefined, coordinate: Coordinate) {
    return !this.history.find(move => this.isSamePiece(move, piece!) && this.isSameCoordinate(move, coordinate));
  }

  private hasRookProperColor(piece: Piece | undefined, kingColor: PieceColor | undefined) {
    return piece?.color === kingColor;
  }

  private isRook(piece: Piece | undefined) {
    return piece?.type === PieceType.ROOK;
  }

  private getRookColumn(to: Coordinate) {
    return to.column === 2 ? 0 : 7;
  }

  private isSamePiece(move: Move, piece: Piece) {
    return move.piece.color === piece?.color && move.piece.type === piece?.type;
  }

  private isSameCoordinate(move: Move, coordinate: Coordinate) {
    return move.from.row === coordinate.row && move.from.column === coordinate.column;
  }
}
