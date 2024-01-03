import {inject, Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {initBoard, initBoardSuccessfully, resetChessState} from "./actions";
import {map, of, switchMap} from "rxjs";
import {BoardService} from "../services/board.service";

@Injectable()
export class ChessEffects {

  private boardService = inject(BoardService);
  private actions$ = inject(Actions);

  initBoard$ = createEffect(() => this.actions$.pipe(
      ofType(initBoard, resetChessState),
      switchMap(() => {
        return of(this.boardService.createBoard())
          .pipe(
            map(board => {
              return initBoardSuccessfully({board});
            })
          )
      })
    )
  );
}
