import {ChessState, GameState} from "./state";
import {createReducer, on} from "@ngrx/store";
import {addMoveToHistory, addPieceToCapturedPieces, resetChessState} from "./actions";
import {cloneDeep} from "lodash-es";

const initialState: ChessState = {
  gameState: GameState.REGULAR,
  historyMoves: [],
  capturedPieces: []
};

export const chessReducer = createReducer(initialState,
    on(addMoveToHistory, (state: ChessState, {move}) => {
      const newState: ChessState = cloneDeep(state);
      newState.historyMoves.push(move);
      return newState;
    }),
    on(addPieceToCapturedPieces, (state: ChessState, {piece}) => {
      const newState: ChessState = cloneDeep(state);
      newState.capturedPieces.push(piece);
      return newState;
    }),
    on(resetChessState, (state: ChessState) => {
      return cloneDeep(initialState);
    }),
  )
;
