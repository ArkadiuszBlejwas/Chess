import { Component } from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule} from "@angular/cdk/drag-drop";
import {CommonModule, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'chessboard',
  standalone: true,
  imports: [
    CdkDropListGroup,
    DragDropModule,
    CommonModule,
    CdkDropList,
    NgForOf,
    NgIf
  ],
  templateUrl: './chessboard.component.html',
  styleUrl: './chessboard.component.scss'
})
export class ChessboardComponent {
  board: number[] = Array(64).fill(0);

  constructor() {
    this.board[0] = 1;
    this.board[2] = 1;
  }

  drop(event: CdkDragDrop<number>) {
    // if(event.event.)
    this.board[event.previousContainer.data] = 0;
    this.board[event.container.data] = 1;
  }

  enterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    console.log(drop)
    return this.board[drop.data] === 0;
  }

}
