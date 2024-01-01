import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {CdkDragDrop, DragDropModule} from "@angular/cdk/drag-drop";

interface Position {
  row: number;
  col: number;
}

const displayPieces: Record<string, string> = {
  'blackpawn': '♟︎',
  'blackking': '♚',
  'blackqueen': '♛',
  'blackknight': '♞',
  'blackrook': '♜',
  'blackbishop': '♝',
  'whitepawn': '♙',
  'whiteking': '♔',
  'whitequeen': '♕',
  'whiteknight': '♘',
  'whiterook': '♖',
  'whitebishop': '♗',
}

interface Piece {
  type: string;
  board: Cell[][];
  color: 'white' | 'black';
  validMove(row: number, col: number): boolean;
}

interface Cell {
  piece?: Piece;
}

@Component({
  selector: 'chessboard2',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './chessboard2.component.html',
  styleUrl: './chessboard2.component.scss'
})
export class Chessboard2Component {
  board: Cell[][] = createBoard();

  displayPiece(row: number, col: number): string {
    const p = this.board[row][col].piece;
    // console.log('Piece: ' + p?.type+' row: '+row+' col: '+col)
    return p ? displayPieces[`${p.color}${p.type}`] : '';
  }

  getPieceColor(row: number, col: number) {
    return this.board[row][col].piece?.color;
  }

  move(event: CdkDragDrop<any, Position, Position>) {
    const oldPos = event.item.data
    const newPos = event.container.data

    if (this.validMove(oldPos.row, oldPos.col, newPos.row, newPos.col)) {
      const piece = this.board[oldPos.row][oldPos.col].piece;
      this.board[oldPos.row][oldPos.col].piece = undefined;
      this.board[newPos.row][newPos.col].piece = piece;
    }
  }
  validMove(oldRow: number, oldCol: number, newRow: number, newCol: number): boolean {
    const piece = this.board[oldRow][oldCol].piece;

    switch (piece?.type) {
      case 'pawn':
        const moveDirection = piece.color === "white" ? -1 : 1;
        return newRow === oldRow + moveDirection && newCol === oldCol;
      default:
        return false;
    }

  }
}

function getStartingPiece(row: number, col: number, board: Cell[][]): Piece | undefined {
  const color = row === 1 || row === 0 ? 'black' : 'white';
  if (row === 1 || row === 6) {
    return pawn(board, color);
  }

  if (row === 0 || row === 7) {
    switch (col) {
      case 0:
      case 7:
        return rook(board, color);
      case 1:
      case 6:
        return knight(board, color);
      case 2:
      case 5:
        return bishop(board, color);
      case 3:
        return row === 0 ? queen(board, color) : king(board, color);
      case 4:
        return row === 0 ? king(board, color) : queen(board, color);
    }
  }

  return undefined;
}

function pawn(board: Cell[][], color: 'white' | 'black'): Piece {
  return {
    type: 'pawn',
    board,
    color,
    validMove(row: number, col: number): boolean {
      const moveDirection = color === "white" ? 1 : -1;
      return false;
    }
  }
}

function queen(board: Cell[][], color: 'white' | 'black'): Piece {
  return {
    type: 'queen',
    board,
    color,
    validMove(row: number, col: number): boolean {
      return false;
    }
  }
}

function king(board: Cell[][], color: 'white' | 'black'): Piece {
  return {
    type: 'king',
    board,
    color,
    validMove(row: number, col: number): boolean {
      return false;
    }
  }
}
function rook(board: Cell[][], color: 'white' | 'black'): Piece {
  return {
    type: 'rook',
    board,
    color,
    validMove(row: number, col: number): boolean {
      return false;
    }
  }
}
function bishop(board: Cell[][], color: 'white' | 'black'): Piece {
  return {
    type: 'bishop',
    board,
    color,
    validMove(row: number, col: number): boolean {
      return false;
    }
  }
}
function knight(board: Cell[][], color: 'white' | 'black'): Piece {
  return {
    type: 'knight',
    board,
    color,
    validMove(row: number, col: number): boolean {
      return false;
    }
  }
}

function pieceDisplay(piece: Piece) {

}

function createBoard(): Cell[][] {
  const board: Cell[][] = [];
  for (let i = 0; i < 8; i++) {
    board.push([])
    for (let j = 0; j < 8; j++) {
      const cell: Cell = {}
      cell.piece = getStartingPiece(i, j, board);
      board[i].push(cell)
    }
  }
  return board;
}
