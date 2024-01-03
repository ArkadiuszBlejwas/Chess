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
import {Piece} from "../../domain/model/piece";
import {CheckTarget} from "../../domain/model/check-target";
import {PieceColor} from "../../domain/model/piece-color";
import {PieceType} from "../../domain/model/piece-type";
import {Field} from "../../domain/model/field";
import {Coordinate} from "../../domain/model/coordinate";
import {MoveType} from "../../domain/model/move-type";
import {ContextStrategy} from "../../domain/validation/context-strategy";
import {Subject, takeUntil} from "rxjs";
import {cloneDeep} from "lodash-es";
import {BoardService} from "../../services/board.service";

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

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly boardService = inject(BoardService);

  @Input()
  row!: number;

  @Input()
  column!: number;

  @Output()
  selectedPieceChange = new EventEmitter<Coordinate>;

  @Output()
  targetMapChange = new EventEmitter<Map<string, MoveType>>;

  board!: Field[][];

  currentColor!: PieceColor;

  contextStrategy = new ContextStrategy();

  ngOnInit(): void {
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
      this.targetMapChange.emit(this.contextStrategy.validateTarget(piece.type, target));
      this.selectedPieceChange.emit({row, column});
    }
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
