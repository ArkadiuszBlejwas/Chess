import {PieceType} from "../model/piece-type";
import {ValidationStrategy} from "./validation-strategy";
import {PawnValidator} from "./pawn-validator";
import {KingValidator} from "./king-validator";
import {QueenValidator} from "./queen-validator";
import {KnightValidator} from "./knight-validator";
import {RookValidator} from "./rook-validator";
import {BishopValidator} from "./bishop-validator";
import {MoveType} from "../model/move-type";
import {CheckTarget} from "../model/check-target";

export class ContextStrategy {

  private strategyMap!: Map<PieceType, ValidationStrategy>;

  constructor() {
    this.strategyMap = new Map<PieceType, ValidationStrategy>([
      [PieceType.PAWN, new PawnValidator()],
      [PieceType.KING, new KingValidator()],
      [PieceType.ROOK, new RookValidator()],
      [PieceType.QUEEN, new QueenValidator()],
      [PieceType.KNIGHT, new KnightValidator()],
      [PieceType.BISHOP, new BishopValidator()]
    ]);
  }

  validateTarget(pieceType: PieceType, target: CheckTarget): Map<string, MoveType> {
    const { from, board } = target;
    return this.getValidator(pieceType).checkTarget(from, board);
  }

  private getValidator(pieceType: PieceType): ValidationStrategy {
    return this.strategyMap.get(pieceType)!;
  }
}
