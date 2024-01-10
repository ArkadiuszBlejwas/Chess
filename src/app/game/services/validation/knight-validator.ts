import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../../model/coordinate";
import {Field} from "../../model/field";
import {MoveType} from "../../model/move-type";
import {PieceColor} from "../../model/piece-color";

export class KnightValidator extends ValidationHelper implements ValidationStrategy {

  checkDestination(from: Coordinate, board: Field[][]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getOpponentColor(from, board)!;

    const coordinates = [
      {row: from.row - 1, column: from.column - 2},
      {row: from.row - 1, column: from.column + 2},
      {row: from.row + 1, column: from.column - 2},
      {row: from.row + 1, column: from.column + 2},
      {row: from.row - 2, column: from.column - 1},
      {row: from.row - 2, column: from.column + 1},
      {row: from.row + 2, column: from.column - 1},
      {row: from.row + 2, column: from.column + 1}
    ];

    coordinates.forEach(coordinate => this.validateCoordinate(coordinate, board, color, toMap));

    return toMap;
  }

  private validateCoordinate(leftTopCoordinate: Coordinate, board: Field[][], color: PieceColor, toMap: Map<string, MoveType>) {
    if (this.isEmptyField(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.REGULAR);
    }
    if (color === this.getPieceColor(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.CAPTURE);
    }
  }
}
