import {PieceType} from "../model/piece-type";
import {ValidationStrategy} from "./validation-strategy";
import {PawnValidator} from "./pawn-validator";
import {KingValidator} from "./king-validator";
import {QueenValidator} from "./queen-validator";
import {KnightValidator} from "./knight-validator";
import {RookValidator} from "./rook-validator";
import {BishopValidator} from "./bishop-validator";
import {ValidatedMove} from "../model/validated-move";
import {InitialValidator} from "./initial-validator";
import {MoveType} from "../model/move-type";
import {CheckTarget} from "../model/check-target";
import {Coordinate} from "../model/coordinate";

export class ContextStrategy {

  private strategyMap!: Map<PieceType, ValidationStrategy>;

  private initialValidator = new InitialValidator();

  constructor() {
    // this.strategyMap = new Map<PieceType, ValidationStrategy>([
    //   [PieceType.PAWN, new PawnValidator()],
    //   [PieceType.KING, new KingValidator()],
    //   [PieceType.ROOK, new RookValidator()],
    //   [PieceType.QUEEN, new QueenValidator()],
    //   [PieceType.KNIGHT, new KnightValidator()],
    //   [PieceType.BISHOP, new BishopValidator()]
    // ]);

    this.strategyMap = new Map<PieceType, ValidationStrategy>([
      [PieceType.PAWN, new PawnValidator()],
      [PieceType.KING, new PawnValidator()],
      [PieceType.ROOK, new PawnValidator()],
      [PieceType.QUEEN, new PawnValidator()],
      [PieceType.KNIGHT, new PawnValidator()],
      [PieceType.BISHOP, new PawnValidator()]
    ]);
  }

  validateMove(pieceType: PieceType, target: CheckTarget): Map<Coordinate, MoveType> {
    // if (this.initialValidator.validateInitial(move)) {
    //   const {from, to, board} = move;
    //   return this.getValidator(pieceType).validateMove(from, to, board);
    // }
    // return MoveType.INVALID;
    const { from, board } = target;
    return this.getValidator(pieceType).checkDestination(from, board);
  }

  private getValidator(pieceType: PieceType): ValidationStrategy {
    return this.strategyMap.get(pieceType)!;
  }
}
