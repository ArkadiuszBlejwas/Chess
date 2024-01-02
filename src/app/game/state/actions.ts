import {createAction, props} from "@ngrx/store";
import {Move} from "../domain/model/move";
import {Piece} from "../domain/model/piece";

export const addMoveToHistory = createAction('Add move to history', props<{
  move: Move;
}>());

export const addPieceToCapturedPieces = createAction('Add piece to captured pieces', props<{
  piece: Piece;
}>());

export const resetChessState = createAction('Reset chess state');
