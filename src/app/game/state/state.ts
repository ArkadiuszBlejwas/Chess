import {Move} from "../domain/model/move";
import {Field} from "../domain/model/field";
import {PieceColor} from "../domain/model/piece-color";

export interface ChessState {
  board: Field[][];
  gameState: GameState;
  historyMoves: Move[];
  currentColor: PieceColor;
}

export enum GameState {
  REGULAR = 'REGULAR',
  STALE_MATE = 'STALE_MATE',
  CHECK = 'CHECK',
  CHECK_MATE = 'CHECK_MATE',
}
