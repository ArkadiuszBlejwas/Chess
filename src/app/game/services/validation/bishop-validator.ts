import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../../model/coordinate";
import {Field} from "../../model/field";
import {MoveType} from "../../model/move-type";
import {PieceColor} from "../../model/piece-color";

export class BishopValidator extends ValidationHelper implements ValidationStrategy {

  checkDestination(from: Coordinate, board: Field[][]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getOpponentColor(from, board)!;

    let leftTopContinue = true;
    let rightTopContinue = true;
    let leftBottomContinue = true;
    let rightBottomContinue = true;

    let leftTopCoordinate = from;
    let rightTopCoordinate = from;
    let leftBottomCoordinate = from;
    let rightBottomCoordinate = from;

    for (let i = 0; i < 7; i++) {

      leftTopCoordinate = { row: leftTopCoordinate.row - 1, column: leftTopCoordinate.column - 1 };
      if (leftTopContinue) {
        if (this.isEmptyField(leftTopCoordinate, board)) {
          toMap.set(JSON.stringify(leftTopCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(leftTopCoordinate, board)) {
          toMap.set(JSON.stringify(leftTopCoordinate), MoveType.CAPTURE);
          leftTopContinue = false;
        } else {
          leftTopContinue = false;
        }
      }

      rightTopCoordinate = { row: rightTopCoordinate.row - 1, column: rightTopCoordinate.column + 1 };
      if (rightTopContinue) {
        if (this.isEmptyField(rightTopCoordinate, board)) {
          toMap.set(JSON.stringify(rightTopCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(rightTopCoordinate, board)) {
          toMap.set(JSON.stringify(rightTopCoordinate), MoveType.CAPTURE);
          rightTopContinue = false;
        } else {
          rightTopContinue = false;
        }
      }

      leftBottomCoordinate = { row: leftBottomCoordinate.row + 1, column: leftBottomCoordinate.column - 1 };
      if (leftBottomContinue) {
        if (this.isEmptyField(leftBottomCoordinate, board)) {
          toMap.set(JSON.stringify(leftBottomCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(leftBottomCoordinate, board)) {
          toMap.set(JSON.stringify(leftBottomCoordinate), MoveType.CAPTURE);
          leftBottomContinue = false;
        } else {
          leftBottomContinue = false;
        }
      }

      rightBottomCoordinate = { row: rightBottomCoordinate.row + 1, column: rightBottomCoordinate.column + 1 };
      if (rightBottomContinue) {
        if (this.isEmptyField(rightBottomCoordinate, board)) {
          toMap.set(JSON.stringify(rightBottomCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(rightBottomCoordinate, board)) {
          toMap.set(JSON.stringify(rightBottomCoordinate), MoveType.CAPTURE);
          rightBottomContinue = false;
        } else {
          rightBottomContinue = false;
        }
      }
    }
    return toMap;
  }
}
