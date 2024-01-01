import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";

export class KnightValidator extends ValidationHelper implements ValidationStrategy {

  validateMove(from: Coordinate, to: Coordinate, board: Field[][]): MoveType {
    const distanceColumn: number = this.getDistanceColumn(from, to);
    const distanceRow: number = this.getDistanceRow(from, to);

    if (Math.pow(distanceColumn, 2) + Math.pow(distanceRow, 2) === 5) {
      if (this.isRegularMove(to, board)) {
        return MoveType.REGULAR;
      }
      if (this.isCaptureMove(from, to, board)) {
        return MoveType.CAPTURE;
      }
    }
    return MoveType.INVALID;
  }
}
