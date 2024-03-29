import {createAction, props} from "@ngrx/store";
import {Move} from "../model/move";
import {Field} from "../model/field";
import {Coordinate} from "../model/coordinate";
import {PieceType} from "../model/piece-type";
import {GameState} from "./state";

export const initBoard = createAction('Init board');

export const initBoardSuccessfully = createAction('Init board successfully', props<{
  board: Field[][];
}>());

export const changeBoard = createAction('Change board', props<{
  board: Field[][];
}>());

export const changePieceType = createAction('Change piece type', props<{
  coordinate: Coordinate;
  pieceType: PieceType;
}>());

export const changeGameState = createAction('Change game state', props<{
  gameState: GameState;
}>());

export const addMoveToHistory = createAction('Add move to history', props<{
  move: Move;
}>());

export const toggleCurrentColor = createAction('Toggle current color');

export const resetChessState = createAction('Reset chess state');
