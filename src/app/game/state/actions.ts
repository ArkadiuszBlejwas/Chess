import {createAction, props} from "@ngrx/store";
import {Move} from "../domain/model/move";
import {Field} from "../domain/model/field";

export const initBoard = createAction('Init board');

export const initBoardSuccessfully = createAction('Init board successfully', props<{
  board: Field[][];
}>());

export const addMoveToHistory = createAction('Add move to history', props<{
  move: Move;
}>());

export const toggleCurrentColor = createAction('Toggle current color');

export const resetChessState = createAction('Reset chess state');
