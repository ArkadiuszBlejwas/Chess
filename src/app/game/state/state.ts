import {Move} from "../domain/model/move";
import {Piece} from "../domain/model/piece";

export interface ChessState {
  gameState: GameState;
  historyMoves: Move[];
  capturedPieces: Piece[];
}

export enum GameState {
  REGULAR = 'REGULAR',
  STALE_MATE = 'STALE_MATE',
  CHECK = 'CHECK',
  CHECK_MATE = 'CHECK_MATE',
}
