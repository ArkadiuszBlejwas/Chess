import {inject, Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {initBoard, initBoardSuccessfully, resetChessState} from "./actions";
import {map, of, switchMap} from "rxjs";
import {GameBoardService} from "../services/game-board.service";

@Injectable()
export class ChessEffects {

  private boardService = inject(GameBoardService);
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
