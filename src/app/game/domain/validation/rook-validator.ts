import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";
import {PieceColor} from "../model/piece-color";

export class RookValidator extends ValidationHelper implements ValidationStrategy {

  checkTarget(from: Coordinate, board: Field[][]): Map<string, MoveType> {
    const toMap: Map<string, MoveType> = new Map<string, MoveType>;
    const color: PieceColor = this.getOpponentColor(from, board)!;

    let topContinue = true;
    let rightContinue = true;
    let leftContinue = true;
    let bottomContinue = true;

    let topCoordinate = from;
    let rightCoordinate = from;
    let leftCoordinate = from;
    let bottomCoordinate = from;

    for (let i = 0; i < 7; i++) {

      topCoordinate = { row: topCoordinate.row - 1, column: topCoordinate.column }
      if (topContinue) {
        if (this.isEmptyField(topCoordinate, board)) {
          toMap.set(JSON.stringify(topCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(topCoordinate, board)) {
          toMap.set(JSON.stringify(topCoordinate), MoveType.CAPTURE);
          topContinue = false;
        } else {
          topContinue = false;
        }
      }

      rightCoordinate = { row: rightCoordinate.row, column: rightCoordinate.column + 1 }
      if (rightContinue) {
        if (this.isEmptyField(rightCoordinate, board)) {
          toMap.set(JSON.stringify(rightCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(rightCoordinate, board)) {
          toMap.set(JSON.stringify(rightCoordinate), MoveType.CAPTURE);
          rightContinue = false;
        } else {
          rightContinue = false;
        }
      }

      leftCoordinate = { row: leftCoordinate.row, column: leftCoordinate.column - 1 }
      if (leftContinue) {
        if (this.isEmptyField(leftCoordinate, board)) {
          toMap.set(JSON.stringify(leftCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(leftCoordinate, board)) {
          toMap.set(JSON.stringify(leftCoordinate), MoveType.CAPTURE);
          leftContinue = false;
        } else {
          leftContinue = false;
        }
      }

      bottomCoordinate = { row: bottomCoordinate.row + 1, column: bottomCoordinate.column }
      if (bottomContinue) {
        if (this.isEmptyField(bottomCoordinate, board)) {
          toMap.set(JSON.stringify(bottomCoordinate), MoveType.REGULAR);
        }
        else if (color === this.getPieceColor(bottomCoordinate, board)) {
          toMap.set(JSON.stringify(bottomCoordinate), MoveType.CAPTURE);
          bottomContinue = false;
        } else {
          bottomContinue = false;
        }
      }
    }
    return toMap;
  }
}
