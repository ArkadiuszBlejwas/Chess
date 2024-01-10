import {Move} from "../model/move";
import {Field} from "../model/field";
import {PieceColor} from "../model/piece-color";
import {cloneDeep} from "lodash-es";
import {MoveType} from "../model/move-type";
import {Coordinate} from "../model/coordinate";
import {CheckDestination} from "../model/check-destination";
import {GameState} from "../state/state";
import {Piece} from "../model/piece";
import {PieceType} from "../model/piece-type";
import {inject, Injectable, Injector, ProviderToken} from "@angular/core";
import {MoveMakerService} from "./move-maker.service";
import {ContextStrategyService} from "./context-strategy.service";

@Injectable({
  providedIn: 'root'
})
export class CheckValidatorService {

  private readonly moveMakerService = inject(MoveMakerService);
  private readonly injector = inject(Injector);

  private contextStrategyService!: ContextStrategyService;

  constructor() {
    this.injectCheckValidatorService();
  }

  willNotKingInCheck(move: Move, board: Field[][], currentColor: PieceColor, moveHistory: Move[]): boolean {
    const copiedBoard: Field[][] = cloneDeep(board);
    switch (move.moveType) {
      case MoveType.REGULAR:
      case MoveType.CAPTURE:
        this.moveMakerService.makeRegularOrCaptureMove(move, copiedBoard);
        break;
      case MoveType.EN_PASSANT:
        this.moveMakerService.makeEnPassantMove(move, copiedBoard);
        break;
      case MoveType.CASTLING:
        this.moveMakerService.makeCastlingMove(move, copiedBoard);
        break;
    }
    return !this.isKingInCheck(copiedBoard, currentColor, moveHistory);
  }

  isKingInCheck(board: Field[][], color: PieceColor, moveHistory: Move[], coordinate?: Coordinate): boolean {
    const opponentColor: PieceColor = this.getOpponentColor(color);
    const piecesCoordinates: Coordinate[] = this.getPiecesCoordinates(board, opponentColor)!;
    const kingCoordinate: Coordinate = coordinate || this.getKingCoordinate(board, color)!;

    for (let coordinate of piecesCoordinates) {
      const checkDestination: CheckDestination = {from: coordinate, color: opponentColor, board};
      const destinationMap: Map<string, MoveType> = this.contextStrategyService
        .validateDestination(checkDestination, moveHistory, false);

      if (destinationMap.has(JSON.stringify(kingCoordinate))) {
        return true;
      }
    }
    return false;
  }

  private getOpponentColor(color: PieceColor) {
    return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }

  getGameState(board: Field[][], currentColor: PieceColor, moveHistory: Move[]): GameState {
    const isKingInCheck = this.isKingInCheck(board, currentColor, moveHistory);
    const isAnyMoveValid = this.isAnyMoveValid(board, currentColor, moveHistory);

    if (isKingInCheck) {
      if (isAnyMoveValid) {
        return GameState.CHECK;
      } else {
        return GameState.CHECK_MATE;
      }
    } else {
      if (isAnyMoveValid) {
        return GameState.REGULAR;
      } else {
        return GameState.STALE_MATE;
      }
    }
  }

  private isAnyMoveValid(board: Field[][], color: PieceColor, moveHistory: Move[]): boolean {
    const piecesCoordinates: Coordinate[] = this.getPiecesCoordinates(board, color)!;

    for (let from of piecesCoordinates) {
      const checkDestination: CheckDestination = { from, color, board };
      const destinationMap: Map<string, MoveType> = this.contextStrategyService
        .validateDestination(checkDestination, moveHistory, false);

      for (let [coordinate, moveType] of destinationMap) {
        const piece: Piece = board[from.row][from.column].piece!;
        const to: Coordinate = JSON.parse(coordinate);
        const move: Move = { from, to, moveType, piece };

        if (this.willNotKingInCheck(move, board, color, moveHistory)) {
          return true;
        }
      }
    }
    return false;
  }

  private getKingCoordinate(board: Field[][], color: PieceColor): Coordinate | undefined {
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const piece = board[row][column].piece;
        if (piece?.color === color && piece.type === PieceType.KING) {
          return {row, column};
        }
      }
    }
    return;
  }

  private getPiecesCoordinates(board: Field[][], color: PieceColor): Coordinate[] {
    const piecesCoordinates: Coordinate[] = [];
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const piece = board[row][column].piece;
        if (piece?.color === color) {
          piecesCoordinates.push({row, column});
          if (piecesCoordinates.length === 16) {
            return piecesCoordinates;
          }
        }
      }
    }
    return piecesCoordinates;
  }

  private async injectCheckValidatorService() {
    this.contextStrategyService = await this.get<ContextStrategyService>(() =>
      import('./context-strategy.service').then((m) => m.ContextStrategyService)
    );
  }

  private async get<T>(providerLoader: () => Promise<ProviderToken<T>>) {
    return this.injector.get(await providerLoader());
  }
}
