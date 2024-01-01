import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";

export class RookValidator extends ValidationHelper implements ValidationStrategy {

  validateMove(from: Coordinate, to: Coordinate, board: Field[][]): MoveType {

    if (this.isVerticalMove(from, to, board) || this.isHorizontalMove(from, to, board)) {
      if (this.isRegularMove(to, board)) {
        return MoveType.REGULAR
      }
      if (this.isCaptureMove(from, to, board)) {
        return MoveType.CAPTURE;
      }
    }
    return MoveType.INVALID;
  }
}
