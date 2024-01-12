import {Move} from "../model/move";
import {Field} from "../model/field";
import {PieceColor} from "../model/piece-color";

export interface ChessState {
  board: Field[][];
  gameState: GameState;
  moveHistory: Move[];
  currentColor: PieceColor;
}

export enum GameState {
  REGULAR = 'REGULAR',
  STALE_MATE = 'STALE_MATE',
  CHECK = 'CHECK',
  CHECK_MATE = 'CHECK_MATE',
  DRAW = 'DRAW'
}
