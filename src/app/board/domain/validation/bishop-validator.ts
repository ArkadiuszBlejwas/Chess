import {ValidationHelper} from "./validation-helper";
import {ValidationStrategy} from "./validation-strategy";
import {Coordinate} from "../model/coordinate";
import {Field} from "../model/field";
import {MoveType} from "../model/move-type";
import {PieceColor} from "../model/piece-color";
import {CheckTarget} from "../model/check-target";

export class BishopValidator extends ValidationHelper implements ValidationStrategy {

  checkDestination(from: Coordinate, board: Field[][]): Map<Coordinate, MoveType> {
    const toMap: Map<Coordinate, MoveType> = new Map<Coordinate, MoveType>;

    return toMap;
  }

  // validateMove(from: Coordinate, to: Coordinate, board: Field[][]): MoveType {
  //
  //   if (this.isDiagonalMove(from, to, board)) {
  //     if (this.isRegularMove(to, board)) {
  //       return MoveType.REGULAR;
  //     }
  //     if (this.isCaptureMove(from, to, board)) {
  //       return MoveType.CAPTURE;
  //     }
  //   }
  //   return MoveType.INVALID;
  // }
}
