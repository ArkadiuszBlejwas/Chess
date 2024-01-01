import {createFeatureSelector} from "@ngrx/store";
import {ChessState} from "./state";

export const selectChessState = createFeatureSelector<ChessState>('chess');
