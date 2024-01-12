import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../../model/coordinate";
import {Field} from "../../model/field";
import {MoveType} from "../../model/move-type";
import {Move} from "../../model/move";
import {PieceType} from "../../model/piece-type";
import {Piece} from "../../model/piece";
import {PieceColor} from "../../model/piece-color";
import {CheckDestination} from "../../model/check-destination";
import {CheckValidatorService} from "../check-validator.service";
import {inject} from "@angular/core";

export class KingValidator extends ValidationHelper implements ValidationStrategy {

  private readonly checkValidatorService = inject(CheckValidatorService);

  checkDestination(from: Coordinate, board: Field[][], moveHistory: Move[], checkCastling: boolean): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const opponentColor: PieceColor = this.getOpponentColor(from, board)!;
    const checkDestination: CheckDestination = {from, board, color: opponentColor};

    this.checkRegularAndCapture(checkDestination, toMap);


    if (checkCastling) {
      const color: PieceColor = this.getPieceColor(from, board)!;

      this.checkShortCastling(checkDestination, color, toMap, moveHistory);
      this.checkLongCastling(checkDestination, color, toMap, moveHistory);
    }

    return toMap;
  }

  private checkRegularAndCapture(checkDestination: CheckDestination, toMap: Map<string, MoveType>) {
    const {from, board, color} = checkDestination;

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
    if (this.isEmptyField(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.REGULAR);
    }
    if (color === this.getPieceColor(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.CAPTURE);
    }
  }

  private checkShortCastling(checkDestination: CheckDestination, color: PieceColor, toMap: Map<string, MoveType>, moveHistory: Move[]) {
    const {from, board} = checkDestination;
    const to: Coordinate = {row: from.row, column: from.column + 2};
    const areEmptyFields = this.areEmptyFieldsForShortCastling(from, board);
    const areFieldsNotInCheck = this.areNotFieldsInCheckForShortCastling(from, color, moveHistory, board);

    const isValidMove = areEmptyFields
      && areFieldsNotInCheck
      && this.isKingWithoutMove(from, board, moveHistory)
      && this.isRookWithoutMove(from, to, board, moveHistory);

    if (isValidMove) {
      toMap.set(JSON.stringify(to), MoveType.CASTLING);
    }
  }

  private checkLongCastling(checkDestination: CheckDestination, color: PieceColor, toMap: Map<string, MoveType>, moveHistory: Move[]) {
    const {from, board} = checkDestination;
    const to: Coordinate = {row: from.row, column: from.column - 2};
    const areEmptyFields = this.areEmptyFieldsForLongCastling(from, board);
    const areFieldsNotInCheck = this.areNotFieldsInCheckForLongCastling(from, color, moveHistory, board);

    const isValidMove = areEmptyFields
      && areFieldsNotInCheck
      && this.isKingWithoutMove(from, board, moveHistory)
      && this.isRookWithoutMove(from, to, board, moveHistory);

    if (isValidMove) {
      toMap.set(JSON.stringify(to), MoveType.CASTLING);
    }
  }

  private areEmptyFieldsForShortCastling(from: Coordinate, board: Field[][]) {
    return this.isEmptyField({row: from.row, column: from.column + 1}, board)
      && this.isEmptyField({row: from.row, column: from.column + 2}, board);
  }

  private areNotFieldsInCheckForShortCastling(from: Coordinate, color: PieceColor, moveHistory: Move[], board: Field[][]) {
    const firstEmptyField: Coordinate = {row: from.row, column: from.column + 1};
    const secondEmptyField: Coordinate = {row: from.row, column: from.column + 2};

    return !(this.checkValidatorService.isKingInCheck(board, color, moveHistory, from)
      || this.checkValidatorService.isKingInCheck(board, color, moveHistory, firstEmptyField)
      || this.checkValidatorService.isKingInCheck(board, color, moveHistory, secondEmptyField));
  }

  private areEmptyFieldsForLongCastling(from: Coordinate, board: Field[][]) {
    return this.isEmptyField({row: from.row, column: from.column - 1}, board)
      && this.isEmptyField({row: from.row, column: from.column - 2}, board)
      && this.isEmptyField({row: from.row, column: from.column - 3}, board);
  }

  private areNotFieldsInCheckForLongCastling(from: Coordinate, color: PieceColor, moveHistory: Move[], board: Field[][]) {
    const firstEmptyField: Coordinate = {row: from.row, column: from.column - 1};
    const secondEmptyField: Coordinate = {row: from.row, column: from.column - 2};
    return !(this.checkValidatorService.isKingInCheck(board, color, moveHistory, from)
      || this.checkValidatorService.isKingInCheck(board, color, moveHistory, firstEmptyField)
      || this.checkValidatorService.isKingInCheck(board, color, moveHistory, secondEmptyField));
  }

  private isKingWithoutMove(from: Coordinate, board: Field[][], moveHistory: Move[]) {
    const king: Piece | undefined = this.getPiece(from, board);
    return this.hasKingNoHistory(king, moveHistory);
  }

  private isRookWithoutMove(from: Coordinate, to: Coordinate, board: Field[][], moveHistory: Move[]) {
    const kingColor = this.getPieceColor(from, board);

    const column = this.getRookColumn(to);
    const coordinate: Coordinate = {row: to.row, column: column};
    const piece: Piece | undefined = this.getPiece(coordinate, board)

    return this.isRook(piece)
      && this.hasRookProperColor(piece, kingColor)
      && this.hasRookNoHistory(piece, coordinate, moveHistory);
  }

  private hasKingNoHistory(king: Piece | undefined, moveHistory: Move[]) {
    return !moveHistory.find(move => this.isSamePiece(move, king!));
  }

  private hasRookNoHistory(piece: Piece | undefined, coordinate: Coordinate, moveHistory: Move[]) {
    return !moveHistory.find(move => this.isSamePiece(move, piece!) && this.isSameCoordinate(move, coordinate));
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
