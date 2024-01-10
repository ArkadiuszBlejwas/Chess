import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {CdkDragDrop, DragDropModule} from "@angular/cdk/drag-drop";
import {Coordinate} from "../../model/coordinate";
import {Field} from "../../model/field";
import {PieceColor} from "../../model/piece-color";
import {Piece} from "../../model/piece";
import {GameBoardService} from "../../services/game-board.service";
import {cloneDeep} from "lodash-es";
import {MoveType} from "../../model/move-type";
import {Subject, takeUntil} from "rxjs";
import {Move} from "../../model/move";
import {PieceComponent} from "../piece/piece.component";
import {AxesComponent} from "../axes/axes.component";
import {MoveMakerService} from "../../services/move-maker.service";

@Component({
  selector: 'board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    PieceComponent,
    AxesComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  private readonly moveMakerService = inject(MoveMakerService);
  private readonly gameBoardService = inject(GameBoardService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  destinationMap = new Map<string, MoveType>;

  selectedPiece?: Coordinate;

  currentColor!: PieceColor;

  moveHistory!: Move[];

  board!: Field[][];

  ngOnInit(): void {
    this.gameBoardService.initBoard();
    this.gameBoardService.getBoard()
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.board = cloneDeep(board);
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
      .subscribe(moveHistory => {
        this.moveHistory = moveHistory;
        this.changeDetector.markForCheck();
      });
  }

  setDestinationMap(destinationMap: Map<string, MoveType>) {
    this.destinationMap = destinationMap;
  }

  setSelectedPiece(selectedPiece: Coordinate) {
    this.selectedPiece = selectedPiece;
  }

  selectDestination(row: number, column: number) {
    if (!!this.selectedPiece) {
      const to = {row, column};
      this.validateMove(this.selectedPiece, to);
    }
  }

  isSelected(row: number, column: number): boolean {
    return this.selectedPiece?.row === row && this.selectedPiece.column === column;
  }

  isDestination(row: number, column: number): boolean {
    return !![...this.destinationMap?.keys()].find(key => JSON.stringify({row, column}) === key);
  }

  isCapture(row: number, column: number): boolean {
    const opponentPiece = this.board[row][column].piece;
    return this.isDestination(row, column) && !!opponentPiece && opponentPiece?.color !== this.currentColor;
  }

  dropPiece(event: CdkDragDrop<any, Coordinate, Coordinate>) {
    const from: Coordinate = event.item.data;
    const to: Coordinate = event.container.data;
    this.validateMove(from, to);
  }

  private validateMove(from: Coordinate, to: Coordinate) {
    if (this.isDestination(to.row, to.column)) {

      const moveType: MoveType = this.destinationMap.get(JSON.stringify(to))!;
      const piece: Piece = this.board[from.row][from.column].piece!;
      const move: Move = {from, to, moveType, piece};

      switch (moveType) {
        case MoveType.REGULAR:
        case MoveType.CAPTURE:
          this.makeRegularOrCaptureMove(move);
          break;
        case MoveType.EN_PASSANT:
          this.makeEnPassantMove(move);
          break;
        case MoveType.CASTLING:
          this.makeCastlingMove(move);
          break;
      }
      this.addMoveToHistory(move);
      this.toggleCurrentColor();
      this.updateGameState();
      this.changeBoard();
    }
    this.clearSelects();
  }

  private makeRegularOrCaptureMove(move: Move) {
    this.moveMakerService.makeRegularOrCaptureMove(move, this.board);
  }

  private makeEnPassantMove(move: Move) {
    this.moveMakerService.makeEnPassantMove(move, this.board);
  }

  private makeCastlingMove(move: Move) {
    this.moveMakerService.makeCastlingMove(move, this.board);
  }

  private updateGameState() {
    this.gameBoardService.updateGameState(this.board, this.currentColor, this.moveHistory);
  }

  private addMoveToHistory(move: Move) {
    this.gameBoardService.addMoveToHistory(cloneDeep(move));
  }

  private changeBoard() {
    this.gameBoardService.changeBoard(this.board);
  }

  private toggleCurrentColor() {
    this.gameBoardService.toggleCurrentColor();
  }

  private clearSelects() {
    this.destinationMap.clear();
    this.selectedPiece = undefined;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
