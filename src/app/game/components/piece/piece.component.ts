import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {CdkDrag} from "@angular/cdk/drag-drop";
import {CommonModule} from "@angular/common";
import {Piece} from "../../model/piece";
import {CheckDestination} from "../../model/check-destination";
import {PieceColor} from "../../model/piece-color";
import {PieceType} from "../../model/piece-type";
import {Field} from "../../model/field";
import {Coordinate} from "../../model/coordinate";
import {MoveType} from "../../model/move-type";
import {ContextStrategyService} from "../../services/context-strategy.service";
import {Subject, takeUntil} from "rxjs";
import {GameBoardService} from "../../services/game-board.service";
import {Move} from "../../model/move";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PromotionComponent} from "../promotion/promotion.component";
import {CheckValidatorService} from "../../services/check-validator.service";
import {GameState} from "../../state/state";

@Component({
  selector: 'piece',
  standalone: true,
  imports: [
    CdkDrag,
    CommonModule
  ],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieceComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  private readonly contextStrategyService = inject(ContextStrategyService);
  private readonly checkValidatorService = inject(CheckValidatorService);
  private readonly gameBoardService = inject(GameBoardService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly matDialog = inject(MatDialog);

  @Input()
  row!: number;

  @Input()
  column!: number;

  @Output()
  selectedPieceChange = new EventEmitter<Coordinate>;

  @Output()
  destinationMapChange = new EventEmitter<Map<string, MoveType>>;

  board!: Field[][];

  moveHistory!: Move[];

  gameState!: GameState;

  currentColor!: PieceColor;

  ngOnInit(): void {
    this.gameBoardService.getBoard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.board = board;
        this.checkPawnPromotion();
        this.changeDetector.markForCheck();
      });
    this.gameBoardService.getCurrentColor()
      .pipe(takeUntil(this.destroy$))
      .subscribe(color => {
        this.currentColor = color;
        this.changeDetector.markForCheck();
      });
    this.gameBoardService.getMoveHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.moveHistory = history;
        this.changeDetector.markForCheck();
      });
    this.gameBoardService.getGameState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(gameState => {
        this.gameState = gameState;
        this.changeDetector.markForCheck();
      });
  }

  selectPiece(row: number, column: number, event: MouseEvent) {
    if (this.isPieceCurrentColor(row, column) && this.isNotEndGame()) {
      event.stopPropagation();
      this.dragPiece(row, column);
    }
  }

  displayPiece(row: number, column: number): boolean {
    return !!this.board[row][column].piece;
  }

  imageSrc(row: number, column: number): string {
    const piece: Piece = this.board[row][column].piece!;
    return this.getPieceImageSrc(piece);
  }

  dragPiece(row: number, column: number) {
    if (this.isPieceCurrentColor(row, column) && this.isNotEndGame()) {
      const checkDestination: CheckDestination = {from: {row, column}, board: this.board};

      this.destinationMapChange.emit(this.getDestinationMap(checkDestination));
      this.selectedPieceChange.emit({row, column});
    }
  }

  private getDestinationMap(checkDestination: CheckDestination): Map<string, MoveType> {
    const destinationMap: Map<string, MoveType> = this.contextStrategyService
      .validateDestination(checkDestination, this.moveHistory);

    for (let [coordinate, moveType] of destinationMap) {
      const piece: Piece = this.board[checkDestination.from.row][checkDestination.from.column].piece!;
      const move: Move = {from: checkDestination.from, to: JSON.parse(coordinate), piece, moveType};

      if (this.willKingInCheck(move)) {
        destinationMap.delete(coordinate);
      }
    }
    return destinationMap;
  }

  private willKingInCheck(move: Move): boolean {
    return !this.checkValidatorService.willNotKingInCheck(move, this.board, this.currentColor, this.moveHistory);
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

  private checkPawnPromotion() {
    const piece: Piece | undefined = this.board[this.row][this.column].piece;
    const isPromotion: boolean = piece?.type === PieceType.PAWN && (this.row === 0 || this.row === 7);

    if (isPromotion) {
      const dialogRef: MatDialogRef<PromotionComponent> = this.matDialog.open(PromotionComponent, {
        data: piece?.color
      });

      dialogRef.afterClosed().subscribe(newPieceType => {
        this.changePieceType({row: this.row, column: this.column}, newPieceType);
        this.changeDetector.markForCheck();
      });
    }
  }

  private changePieceType(coordinate: Coordinate, pieceType: PieceType) {
    this.gameBoardService.changePieceType(coordinate, pieceType);
  }

  private isPieceCurrentColor(row: number, column: number): boolean {
    return this.board[row][column].piece?.color === this.currentColor;
  }

  private isNotEndGame(): boolean {
    return this.gameState !== GameState.CHECK_MATE
      && this.gameState !== GameState.STALE_MATE
      && this.gameState !== GameState.DRAW;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
