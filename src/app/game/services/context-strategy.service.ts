import {PieceType} from "../model/piece-type";
import {ValidationStrategy} from "./validation/validation-strategy";
import {PawnValidator} from "./validation/pawn-validator";
import {KingValidator} from "./validation/king-validator";
import {QueenValidator} from "./validation/queen-validator";
import {KnightValidator} from "./validation/knight-validator";
import {RookValidator} from "./validation/rook-validator";
import {BishopValidator} from "./validation/bishop-validator";
import {MoveType} from "../model/move-type";
import {CheckDestination} from "../model/check-destination";
import {Move} from "../model/move";
import {Injectable, Injector} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ContextStrategyService {

  private readonly strategyMap!: Map<PieceType, ValidationStrategy>;

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

  validateDestination(checkDestination: CheckDestination, moveHistory: Move[], checkCastling = true): Map<string, MoveType> {
    const { from, board } = checkDestination;
    const pieceType: PieceType = board[from.row][from.column].piece!.type;
    return this.getValidator(pieceType).checkDestination(from, board, moveHistory, checkCastling);
  }

  private getValidator(pieceType: PieceType): ValidationStrategy {
    return this.strategyMap.get(pieceType)!;
  }
}
