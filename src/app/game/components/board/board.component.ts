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
import {CheckValidatorService} from "../../services/check-validator.service";
import {GameState} from "../../state/state";
import {PieceType} from "../../model/piece-type";

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

  private readonly checkValidatorService = inject(CheckValidatorService);
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
    const opponentPiece: Piece | undefined = this.board[row][column].piece;
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

      this.makeMove(move);
      this.addMoveToHistory(move);
      this.toggleCurrentColor();
      this.updateGameState();
      this.changeBoard();
    }
    this.clearSelects();
  }

  private makeMove(move: Move, board: Field[][] = this.board) {
    this.moveMakerService.makeMove(move, board);
  }
  private updateGameState() {
    const gameState: GameState = this.checkFiftyMove() || this.checkTripleRepetition() ||
      this.checkValidatorService.getGameState(this.board, this.currentColor, this.moveHistory);
    this.gameBoardService.updateGameState(gameState);
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

  private checkFiftyMove(): GameState | undefined {
    const length: number = this.moveHistory.length;

    if (length > 100) {
      for (let i: number = length - 1; i >= length; i--) {
        const move: Move = this.moveHistory[i];
        const type: PieceType = move.piece.type;
        if (move.moveType !== MoveType.REGULAR || type === PieceType.PAWN) {
          return;
        }
      }
      return GameState.DRAW;
    }
    return;
  }

  private checkTripleRepetition(): GameState | undefined {
    const lastNonRegularMoveIndex: number = this.getLastNonRegularMoveIndex();
    const omittedMoves: Move[] = this.moveHistory.slice(0, lastNonRegularMoveIndex);

    const simulatedBoard: Field[][] = this.gameBoardService.createBoard();
    omittedMoves.forEach(move => this.makeMove(move, simulatedBoard));

    let counter = 0;
    for (let i = lastNonRegularMoveIndex; i < this.moveHistory.length; i++) {
      this.makeMove(cloneDeep(this.moveHistory[i]), simulatedBoard);

      if (JSON.stringify(this.board) === JSON.stringify(simulatedBoard)) {
        counter++;
      }
      if (counter === 3) {
        return GameState.DRAW;
      }
    }
    return;
  }

  private getLastNonRegularMoveIndex(): number {
    for (let index = this.moveHistory.length - 1; index >= 0; index--) {
      const element: Move = this.moveHistory[index];
      if (element.moveType !== MoveType.REGULAR) {
        return index;
      }
    }
    return 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
