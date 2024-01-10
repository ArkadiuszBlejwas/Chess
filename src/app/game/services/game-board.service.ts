import {inject, Injectable} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {ChessState} from "../state/state";
import {
  addMoveToHistory,
  changeBoard,
  changeGameState,
  changePieceType,
  initBoard,
  toggleCurrentColor
} from "../state/actions";
import {Move} from "../model/move";
import {selectChessState} from "../state/selectors";
import {distinctUntilChanged, map, Observable} from "rxjs";
import {isEqual} from "lodash-es";
import {Field} from "../model/field";
import {Piece} from "../model/piece";
import {PieceColor} from "../model/piece-color";
import {PieceType} from "../model/piece-type";
import {Coordinate} from "../model/coordinate";
import {CheckValidatorService} from "./check-validator.service";

@Injectable({
  providedIn: 'root'
})
export class GameBoardService {

  private readonly checkValidatorService = inject(CheckValidatorService);
  private readonly store$ = inject(Store<ChessState>);
  
  initBoard() {
    this.store$.dispatch(initBoard());
  }

  changeBoard(board: Field[][]) {
    this.store$.dispatch(changeBoard({board}));
  }

  toggleCurrentColor() {
    this.store$.dispatch(toggleCurrentColor());
  }

  changePieceType(coordinate: Coordinate, pieceType: PieceType) {
    this.store$.dispatch(changePieceType({coordinate, pieceType}));
  }

  updateGameState(board: Field[][], currentColor: PieceColor, moveHistory: Move[]) {
    const gameState = this.checkValidatorService.getGameState(board, currentColor, moveHistory);
    this.store$.dispatch(changeGameState({gameState}));
  }

  getCurrentColor(): Observable<PieceColor> {
    return this.store$.pipe(
      select(selectChessState),
      map(state => state.currentColor),
      distinctUntilChanged(isEqual));
  }

  getBoard(): Observable<Field[][]> {
    return this.store$.pipe(
      select(selectChessState),
      map(state => state.board),
      distinctUntilChanged(isEqual));
  }

  addMoveToHistory(move: Move) {
    this.store$.dispatch(addMoveToHistory({move}));
  }

  getMoveHistory(): Observable<Move[]> {
    return this.store$.pipe(
      select(selectChessState),
      map(state => state.moveHistory),
      distinctUntilChanged(isEqual));
  }

  createBoard(): Field[][] {
    const board: Field[][] = [];
    [0, 1, 2, 3, 4, 5, 6, 7].forEach(row => {
      board.push([]);
      [0, 1, 2, 3, 4, 5, 6, 7].forEach(column => {
        const field: Field = {}
        field.piece = this.getStartingPiece(row, column);
        board[row].push(field);
      });
    });
    return board;
  }

  private getStartingPiece(row: number, column: number): Piece | undefined {
    const pieceType = this.getPieceType(row, column);
    const pieceColor = this.getStartingColor(row);
    if (pieceType && pieceColor) {
      return {
        type: pieceType,
        color: pieceColor
      }
    }
    return;
  }

  private getStartingColor(row: number) {
    if (row === 0 || row === 1) {
      return PieceColor.BLACK;
    }
    if (row === 6 || row === 7) {
      return PieceColor.WHITE;
    }
    return;
  }

  private getPieceType(row: number, column: number) {
    if (row === 1 || row === 6) {
      return PieceType.PAWN;
    }
    switch (column) {
      case 0:
      case 7:
        return PieceType.ROOK;
      case 1:
      case 6:
        return PieceType.KNIGHT;
      case 2:
      case 5:
        return PieceType.BISHOP;
      case 4:
        return PieceType.KING;
      case 3:
        return PieceType.QUEEN
    }
    return;
  }
}
