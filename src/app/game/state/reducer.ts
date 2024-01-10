import {ChessState, GameState} from "./state";
import {createReducer, on} from "@ngrx/store";
import {
  addMoveToHistory,
  changeBoard,
  changeGameState,
  changePieceType,
  initBoardSuccessfully,
  resetChessState,
  toggleCurrentColor
} from "./actions";
import {cloneDeep} from "lodash-es";
import {PieceColor} from "../model/piece-color";

const initialState: ChessState = {
  board: [],
  gameState: GameState.REGULAR,
  moveHistory: [],
  currentColor: PieceColor.WHITE
};

export const chessReducer = createReducer(initialState,
    on(initBoardSuccessfully, (state: ChessState, {board}) => {
      const newState: ChessState = cloneDeep(state);
      newState.board = board;
      return newState;
    }),
    on(changeBoard, (state: ChessState, {board}) => {
      const newState: ChessState = cloneDeep(state);
      newState.board = board;
      return newState;
    }),
    on(addMoveToHistory, (state: ChessState, {move}) => {
      const newState: ChessState = cloneDeep(state);
      newState.moveHistory.push(move);
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
    on(changePieceType, (state: ChessState, {coordinate, pieceType}) => {
      const newState: ChessState = cloneDeep(state);
      const piece = newState.board[coordinate.row][coordinate.column].piece;
      !!piece && (piece.type = pieceType);
      return newState;
    }),
    on(changeGameState, (state: ChessState, {gameState}) => {
      const newState: ChessState = cloneDeep(state);
      newState.gameState = gameState;
      return newState;
    }),
    on(resetChessState, (state: ChessState) => {
      return cloneDeep(initialState);
    }),
  )
;


