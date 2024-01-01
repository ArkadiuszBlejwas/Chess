import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PieceType} from "../domain/model/piece-type";
import {CdkDragDrop, DragDropModule} from "@angular/cdk/drag-drop";
import {Coordinate} from "../domain/model/coordinate";
import {Field} from "../domain/model/field";
import {PieceColor} from "../domain/model/piece-color";
import {Piece} from "../domain/model/piece";
import {BoardService} from "../services/board.service";
import {cloneDeep} from "lodash-es";
import {MoveType} from "../domain/model/move-type";
import {ContextStrategy} from "../domain/validation/context-strategy";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PromotionComponent} from "./promotion/promotion.component";
import {ValidatedMove} from "../domain/model/validated-move";
import {GameState} from "../state/state";

@Component({
  selector: 'board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {

  currentColor = PieceColor.WHITE;

  contextStrategy = new ContextStrategy();

  changeDetector = inject(ChangeDetectorRef);
  boardService = inject(BoardService);
  matDialog = inject(MatDialog);

  board = this.boardService.createBoard();

  selectedCoordinate?: Coordinate;

  to= new Map<Coordinate, MoveType>;

  select(coordinate: Coordinate) {

    // if (!!this.selectedCoordinate) {
    //   this.validateMove(this.selectedCoordinate, coordinate);
    //   this.selectedCoordinate = undefined;
    // } else {
    //   this.selectedCoordinate = coordinate;
    // }

    if (!!this.selectedCoordinate) {
      // this.validateMove(this.selectedCoordinate, coordinate);
      this.selectedCoordinate = undefined;
      this.to = new Map<Coordinate, MoveType>;
    } else {
      this.selectedCoordinate = coordinate;
      this.to = this.getMoveType2(coordinate);
    }
  }

  showTo(row: number, column: number): boolean {
    return !![...this.to?.keys()].find(key => key.row === row && key.column === column);
  }

  getMoveType2(from: Coordinate): Map<Coordinate, MoveType> {
    const color: PieceColor = this.board[from.row][from.column].piece?.color!;
    const direction: number = color === PieceColor.WHITE ? -1 : 1;

    const toMap = new Map<Coordinate, MoveType>;
    const toShortMove = {row: from.row + direction, column: from.column};
    if (!this.board[toShortMove.row][toShortMove.column].piece) {
      toMap.set(toShortMove, MoveType.REGULAR);
    }
    const toLongMove = {row: from.row + direction * 2, column: from.column};
    if (!this.board[toLongMove.row][toLongMove.column].piece && color === PieceColor.WHITE ? 6 : 1) {
      toMap.set(toLongMove, MoveType.REGULAR);
    }
    return toMap;
  }

  displayPiece(row: number, column: number): boolean {
    return !!this.board[row][column].piece;
  }

  imageSrc(row: number, column: number): string {
    const piece = this.board[row][column].piece!;
    return this.getPieceImageSrc(piece);
  }

  move(event: CdkDragDrop<any, Coordinate, Coordinate>) {
    const from: Coordinate = event.item.data;
    const to: Coordinate = event.container.data;
    this.validateMove(from, to);
  }

  private validateMove(from: Coordinate, to: Coordinate) {
    const piece: Piece = this.board[from.row][from.column].piece!;
    const move: ValidatedMove = this.getValidatedMove(from, to);
    const moveType: MoveType = this.contextStrategy.validateMove(piece.type, move);

    this.isValidMove(moveType, from, to, piece);
  }

  private isValidMove(moveType: MoveType, from: Coordinate, to: Coordinate, piece: Piece) {
    if (moveType !== MoveType.INVALID && this.willNotKingInCheck(moveType, from, to, piece)) {
      switch (moveType) {
        case MoveType.REGULAR:
        case MoveType.CAPTURE:
          this.makeRegularOrCaptureMove(from, to, piece);
          break;
        case MoveType.EN_PASSANT:
          this.makeEnPassantMove(from, to, piece);
          break;
        case MoveType.CASTLING:
          this.makeCastlingMove(from, to, piece);
          break;
      }
      this.boardService.addMoveToHistory(cloneDeep({from, to, piece}));
      this.checkPawnPromotion(to, piece);
      this.toggleColor();
      this.updateGameState();
    }
  }

  private willNotKingInCheck(moveType: MoveType, from: Coordinate, to: Coordinate, piece: Piece) {
    const copyBoard = cloneDeep(this.board);
    switch (moveType) {
      case MoveType.REGULAR:
      case MoveType.CAPTURE:
        this.makeRegularOrCaptureMove(from, to, piece, copyBoard);
        break;
      case MoveType.EN_PASSANT:
        this.makeEnPassantMove(from, to, piece, copyBoard);
        break;
      case MoveType.CASTLING:
        this.makeCastlingMove(from, to, piece, copyBoard);
        break;
    }
    return !this.isKingInCheck(copyBoard);
  }

  private isKingInCheck(board: Field[][] = this.board, color: PieceColor = this.currentColor): boolean {
    const oppositeColor = this.getOppositeColor(color);
    const piecesCoordinates: Coordinate[] = this.getPiecesCoordinates(board, oppositeColor)!;
    const kingCoordinate: Coordinate = this.getKingCoordinate(board, color)!;

    let result = false;
    piecesCoordinates.forEach(coordinate => {
      const move: ValidatedMove = this.getValidatedMove(coordinate, kingCoordinate, oppositeColor, board);
      const piece: Piece = board[coordinate.row][coordinate.column].piece!;
      const moveType: MoveType = this.contextStrategy.validateMove(piece.type, move);
      if (moveType !== MoveType.INVALID) {
        result = true;
      }
    });
    return result;
  }

  private getKingCoordinate(copyBoard: Field[][], color: PieceColor): Coordinate | undefined {
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const piece = copyBoard[row][column].piece;
        if (piece?.color === color && piece.type === PieceType.KING) {
          return {row, column};
        }
      }
    }
    return;
  }

  private getPiecesCoordinates(copyBoard: Field[][], color: PieceColor): Coordinate[] {
    const piecesCoordinates: Coordinate[] = [];
    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const piece = copyBoard[row][column].piece;
        if (piece?.color === color) {
          piecesCoordinates.push({row, column});
        }
      }
    }
    return piecesCoordinates;
  }

  private getValidatedMove(from: Coordinate, to: Coordinate, color: PieceColor = this.currentColor, board: Field[][] = this.board) {
    return {from, to, color, board: cloneDeep(board)};
  }

  private makeRegularOrCaptureMove(from: Coordinate, to: Coordinate, piece: Piece, board: Field[][] = this.board) {
    board[from.row][from.column].piece = undefined;
    board[to.row][to.column].piece = piece;
  }

  private makeEnPassantMove(from: Coordinate, to: Coordinate, piece: Piece, board: Field[][] = this.board) {
    board[from.row][from.column].piece = undefined;
    board[from.row][to.column].piece = undefined;
    board[to.row][to.column].piece = piece;
  }

  private makeCastlingMove(from: Coordinate, to: Coordinate, piece: Piece, board: Field[][] = this.board) {
    board[from.row][from.column].piece = undefined;
    board[to.row][to.column].piece = piece;

    let horizontalDirection = from.column - to.column > 0 ? 2 : -1;
    const rook: Piece = board[to.row][to.column - horizontalDirection].piece!;
    board[to.row][to.column - horizontalDirection].piece = undefined;
    board[to.row][to.column + (horizontalDirection === 2 ? 1 : -1)].piece = rook;
  }

  private checkPawnPromotion(to: Coordinate, piece: Piece) {
    const isPromotion = piece.type === PieceType.PAWN
      && (piece.color === PieceColor.WHITE && to.row === 0
        || piece.color === PieceColor.BLACK && to.row === 7);

    if (isPromotion) {
      const dialogRef: MatDialogRef<PromotionComponent> = this.matDialog.open(PromotionComponent);

      dialogRef.afterClosed().subscribe(newPieceType => {
        piece.type = newPieceType;
        this.changeDetector.markForCheck();
      });
    }
  }

  private toggleColor() {
    this.currentColor = this.getOppositeColor(this.currentColor);
  }

  private getOppositeColor(color: PieceColor) {
    return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }

  getPieceImageSrc(piece: Piece): string {
    return 'assets/pieces/cardinal/' + this.getPieceFileImage(piece);
  }

  getPieceFileImage(piece: Piece): string {
    return this.getColorLetter(piece.color) + this.getPieceTypeSVG(piece.type);
  }

  private getColorLetter(pieceColor?: PieceColor): string {
    if (pieceColor === PieceColor.WHITE) {
      return 'w';
    }
    if (pieceColor === PieceColor.BLACK) {
      return 'b';
    }
    return '';
  }

  private getPieceTypeSVG(pieceType?: PieceType): string {
    switch (pieceType) {
      case PieceType.PAWN:
        return 'p.svg'
      case PieceType.KING:
        return 'k.svg'
      case PieceType.QUEEN:
        return 'q.svg'
      case PieceType.BISHOP:
        return 'b.svg'
      case PieceType.KNIGHT:
        return 'n.svg'
      case PieceType.ROOK:
        return 'r.svg'
      default:
        return '';
    }
  }

  updateGameState() {
    const isKingInCheck = this.isKingInCheck();
    const isAnyMoveValid = this.isAnyMoveValid();

    if (isKingInCheck) {
      if (isAnyMoveValid) {
        console.log(GameState.CHECK);
      } else {
        console.log(GameState.CHECK_MATE);
      }
    } else {
      if (isAnyMoveValid) {
        console.log(GameState.REGULAR);
      } else {
        console.log(GameState.STALE_MATE);
      }
    }
  }

  isAnyMoveValid(copyBoard: Field[][] = this.board, color: PieceColor = this.currentColor) {
    const piecesCoordinates: Coordinate[] = this.getPiecesCoordinates(copyBoard, color)!;

    let result = false;
    piecesCoordinates.forEach(coordinate => {

      for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
          const move: ValidatedMove = this.getValidatedMove(coordinate, {row, column}, color, copyBoard);
          const piece: Piece = copyBoard[coordinate.row][coordinate.column].piece!;

          const moveType: MoveType = this.contextStrategy.validateMove(piece.type, move);
          if (moveType !== MoveType.INVALID && this.willNotKingInCheck(moveType, move.from, move.to, piece)) {
            result = true;
          }
        }
      }
    });
    return result;
  }
}
