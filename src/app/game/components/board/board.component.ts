import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {PieceType} from "../../domain/model/piece-type";
import {CdkDragDrop, DragDropModule} from "@angular/cdk/drag-drop";
import {Coordinate} from "../../domain/model/coordinate";
import {Field} from "../../domain/model/field";
import {PieceColor} from "../../domain/model/piece-color";
import {Piece} from "../../domain/model/piece";
import {BoardService} from "../../services/board.service";
import {cloneDeep} from "lodash-es";
import {MoveType} from "../../domain/model/move-type";
import {ContextStrategy} from "../../domain/validation/context-strategy";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PromotionComponent} from "../promotion/promotion.component";
import {CheckTarget} from "../../domain/model/check-target";
import {GameState} from "../../state/state";
import {Subject, takeUntil} from "rxjs";
import {Move} from "../../domain/model/move";

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
export class BoardComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly boardService = inject(BoardService);
  private readonly matDialog = inject(MatDialog);

  board!: Field[][];

  currentColor!: PieceColor;

  selectedPiece?: Coordinate;

  targetMap = new Map<string, MoveType>;

  contextStrategy = new ContextStrategy();

  ngOnInit(): void {
    this.boardService.initBoard();
    this.boardService.getBoard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.board = cloneDeep(board);
        this.changeDetector.markForCheck();
      });
    this.boardService.getCurrentColor()
      .pipe(takeUntil(this.destroy$))
      .subscribe(color => {
        this.currentColor = color;
        this.changeDetector.markForCheck();
      });
  }

  selectPiece(row: number, column: number, event: MouseEvent) {
    if (this.board[row][column].piece?.color === this.currentColor) {
      event.stopPropagation();
      this.dragPiece(row, column);
    }
  }

  selectTarget(row: number, column: number) {
    if (!!this.selectedPiece) {
      const to = {row, column};
      this.validateMove(this.selectedPiece, to);
    }
  }

  isSelected(row: number, column: number): boolean {
    return this.selectedPiece?.row === row && this.selectedPiece.column === column;
  }

  isTarget(row: number, column: number): boolean {
    return !![...this.targetMap?.keys()].find(key => JSON.stringify({row, column}) === key);
  }

  isCapture(row: number, column: number): boolean {
    const opponentPiece = this.board[row][column].piece;
    return this.isTarget(row, column) && !!opponentPiece && opponentPiece?.color !== this.currentColor;
  }

  displayPiece(row: number, column: number): boolean {
    return !!this.board[row][column].piece;
  }

  imageSrc(row: number, column: number): string {
    const piece: Piece = this.board[row][column].piece!;
    return this.getPieceImageSrc(piece);
  }

  dragPiece(row: number, column: number) {
    if (this.board[row][column].piece?.color === this.currentColor) {
      const piece: Piece = this.board[row][column].piece!;
      const target: CheckTarget = {from: {row, column}, board: this.board};
      this.targetMap = this.contextStrategy.validateTarget(piece.type, target);
      this.selectedPiece = {row, column};
    }
  }

  dropPiece(event: CdkDragDrop<any, Coordinate, Coordinate>) {
    const from: Coordinate = event.item.data;
    const to: Coordinate = event.container.data;
    this.validateMove(from, to);
  }

  private validateMove(from: Coordinate, to: Coordinate) {
    if (this.isTarget(to.row, to.column)) {
      const moveType: MoveType = this.targetMap.get(JSON.stringify(to))!;
      const piece: Piece = this.board[from.row][from.column].piece!;

      if (this.willNotKingInCheck(moveType, from, to, piece)) {
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
        this.addMoveToHistory({from, to, piece});
        this.checkPawnPromotion(to, piece);
        this.changeBoard(this.board);
        this.toggleCurrentColor();
        this.updateGameState();
      }
    }
    this.clearSelects();
  }

  private changeBoard(board: Field[][]) {
    this.boardService.changeBoard(board);
  }

  private addMoveToHistory(move: Move) {
    this.boardService.addMoveToHistory(cloneDeep(move));
  }

  private toggleCurrentColor() {
    this.boardService.toggleCurrentColor();
  }

  private clearSelects() {
    this.targetMap.clear();
    this.selectedPiece = undefined;
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
    return !this.isKingInCheck2(copyBoard);
  }

  private isKingInCheck(board: Field[][] = this.board, color: PieceColor = this.currentColor): boolean {
    const oppositeColor: PieceColor = this.getOppositeColor(color);
    const piecesCoordinates: Coordinate[] = this.getPiecesCoordinates(board, oppositeColor)!;
    const kingCoordinate: Coordinate = this.getKingCoordinate(board, color)!;

    for (let coordinate of piecesCoordinates) {
      const target: CheckTarget = {from: coordinate, color: oppositeColor, board};
      const piece: Piece = board[coordinate.row][coordinate.column].piece!;
      const mapTarget = this.contextStrategy.validateTarget(piece.type, target);
      if (mapTarget.has(JSON.stringify(kingCoordinate))) {
        return true;
      }
    }
    return false;
  }

  private isKingInCheck2(board: Field[][] = this.board, color: PieceColor = this.currentColor): boolean {
    const oppositeColor: PieceColor = this.getOppositeColor(color);
    const kingCoordinate: Coordinate = this.getKingCoordinate(board, color)!;

    const target: CheckTarget = {from: kingCoordinate, board};
    const arrayMapTarget = new Map<PieceType, Map<string, MoveType>>([
      [PieceType.ROOK, this.contextStrategy.validateTarget(PieceType.ROOK, target)],
      [PieceType.BISHOP, this.contextStrategy.validateTarget(PieceType.BISHOP, target)],
      [PieceType.QUEEN, this.contextStrategy.validateTarget(PieceType.QUEEN, target)],
      [PieceType.KNIGHT, this.contextStrategy.validateTarget(PieceType.KNIGHT, target)],
      [PieceType.PAWN, this.contextStrategy.validateTarget(PieceType.PAWN, target)]
    ]);
    for (let [moveType, mapTarget] of arrayMapTarget) {
      for (let coordinate of [...mapTarget.keys()]) {
        const correctCoordinate: Coordinate = JSON.parse(coordinate);
        const piece = board[correctCoordinate.row][correctCoordinate.column].piece;
        if (piece?.color === oppositeColor && piece?.type === moveType) {
          return true;
        }
      }
    }
    return false;
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
          if (piecesCoordinates.length === 16) {
            return piecesCoordinates;
          }
        }
      }
    }
    return piecesCoordinates;
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

  private getOppositeColor(color: PieceColor) {
    return color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  }

  private getPieceImageSrc(piece: Piece): string {
    return 'assets/pieces/cardinal/' + this.getPieceFileImage(piece);
  }

  private getPieceFileImage(piece: Piece): string {
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
    const isKingInCheck = this.isKingInCheck2();
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
    for (let coordinate of piecesCoordinates) {

      const target: CheckTarget = {from: coordinate, color, board: copyBoard};
      const piece: Piece = copyBoard[coordinate.row][coordinate.column].piece!;
      const mapTarget = this.contextStrategy.validateTarget(piece.type, target);

      for (let [key, value] of mapTarget) {
        const correctKey: Coordinate = JSON.parse(key);
        if (this.willNotKingInCheck(value, target.from, correctKey, piece)) {
          result = true;
        }
      }
    }
    return result;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
