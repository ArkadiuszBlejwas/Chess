import {Move} from "../model/move";
import {Field} from "../model/field";
import {Piece} from "../model/piece";
import {Injectable} from "@angular/core";
import {MoveType} from "../model/move-type";

@Injectable({
  providedIn: 'root'
})
export class MoveMakerService {

  makeMove(move: Move, board: Field[][]) {
    switch (move.moveType) {
      case MoveType.REGULAR:
      case MoveType.CAPTURE:
        this.makeRegularOrCaptureMove(move, board);
        break;
      case MoveType.EN_PASSANT:
        this.makeEnPassantMove(move, board);
        break;
      case MoveType.CASTLING:
        this.makeCastlingMove(move, board);
        break;
    }
  }

  private makeRegularOrCaptureMove(move: Move, board: Field[][]) {
    const {from, to, piece} = move;
    board[from.row][from.column].piece = undefined;
    board[to.row][to.column].piece = piece;
  }

  private makeEnPassantMove(move: Move, board: Field[][]) {
    const {from, to, piece} = move;
    board[from.row][from.column].piece = undefined;
    board[from.row][to.column].piece = undefined;
    board[to.row][to.column].piece = piece;
  }

  private makeCastlingMove(move: Move, board: Field[][]) {
    const {from, to, piece} = move;
    board[from.row][from.column].piece = undefined;
    board[to.row][to.column].piece = piece;

    const horizontalDirection = from.column - to.column > 0 ? 2 : -1;
    const rook: Piece = board[to.row][to.column - horizontalDirection].piece!;
    board[to.row][to.column - horizontalDirection].piece = undefined;
    board[to.row][to.column + (horizontalDirection === 2 ? 1 : -1)].piece = rook;
  }
}
