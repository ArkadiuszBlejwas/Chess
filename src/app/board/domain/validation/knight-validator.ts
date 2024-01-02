import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";
import {PieceColor} from "../model/piece-color";

export class KnightValidator extends ValidationHelper implements ValidationStrategy {

  checkDestination(from: Coordinate, board: Field[][]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getOpponentColor(from, board)!;

    const leftTopCoordinate: Coordinate = {row: from.row - 1, column: from.column - 2};
    const rightTopCoordinate: Coordinate = {row: from.row - 1, column: from.column + 2};
    const leftBottomCoordinate: Coordinate = {row: from.row + 1, column: from.column - 2};
    const rightBottomCoordinate: Coordinate = {row: from.row + 1, column: from.column + 2};
    const leftTopCoordinate2: Coordinate = {row: from.row - 2, column: from.column - 1};
    const rightTopCoordinate2: Coordinate = {row: from.row - 2, column: from.column + 1};
    const leftBottomCoordinate2: Coordinate = {row: from.row + 2, column: from.column - 1};
    const rightBottomCoordinate2: Coordinate = {row: from.row + 2, column: from.column + 1};

    const coordinates = [
      leftTopCoordinate,
      rightTopCoordinate,
      leftBottomCoordinate,
      rightBottomCoordinate,
      leftTopCoordinate2,
      rightTopCoordinate2,
      leftBottomCoordinate2,
      rightBottomCoordinate2
    ];

    coordinates.forEach(coordinate => this.validateCoordinate(coordinate, board, color, toMap));

    return toMap;
  }

  private validateCoordinate(leftTopCoordinate: Coordinate, board: Field[][], color: PieceColor, toMap: Map<string, MoveType>) {
    if (this.isEmptyField2(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.REGULAR);
    }
    if (color === this.getPieceColor(leftTopCoordinate, board)) {
      toMap.set(JSON.stringify(leftTopCoordinate), MoveType.CAPTURE);
    }
  }
}
