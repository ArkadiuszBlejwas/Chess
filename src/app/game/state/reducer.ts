import {ChessState, GameState} from "./state";
import {createReducer, on} from "@ngrx/store";
import {addMoveToHistory, initBoardSuccessfully, resetChessState, toggleCurrentColor} from "./actions";
import {cloneDeep} from "lodash-es";
import {PieceColor} from "../domain/model/piece-color";

const initialState: ChessState = {
  board: [],
  gameState: GameState.REGULAR,
  historyMoves: [],
  currentColor: PieceColor.WHITE
};

export const chessReducer = createReducer(initialState,
    on(initBoardSuccessfully, (state: ChessState, {board}) => {
      const newState: ChessState = cloneDeep(state);
      newState.board = board;
      return newState;
    }),
    on(addMoveToHistory, (state: ChessState, {move}) => {
      const newState: ChessState = cloneDeep(state);
      newState.historyMoves.push(move);
      return newState;
    }),
    on(toggleCurrentColor, (state: ChessState) => {
      const newState: ChessState = cloneDeep(state);
      if (newState.currentColor === PieceColor.WHITE) {
        newState.currentColor = PieceColor.BLACK;
      } else {
        newState.currentColor = PieceColor.WHITE;
      }
      return newState;
    }),
    on(resetChessState, (state: ChessState) => {
      return cloneDeep(initialState);
    }),
  )
;


