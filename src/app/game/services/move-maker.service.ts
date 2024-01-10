import {Move} from "../model/move";
import {Field} from "../model/field";
import {Piece} from "../model/piece";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MoveMakerService {

  makeRegularOrCaptureMove(move: Move, board: Field[][]) {
    const { from, to, piece } = move;
    board[from.row][from.column].piece = undefined;
    board[to.row][to.column].piece = piece;
  }

  makeEnPassantMove(move: Move, board: Field[][]) {
    const { from, to, piece } = move;
    board[from.row][from.column].piece = undefined;
    board[from.row][to.column].piece = undefined;
    board[to.row][to.column].piece = piece;
  }

  makeCastlingMove(move: Move, board: Field[][]) {
    const { from, to, piece } = move;
    board[from.row][from.column].piece = undefined;
    board[to.row][to.column].piece = piece;

    let horizontalDirection = from.column - to.column > 0 ? 2 : -1;
    const rook: Piece = board[to.row][to.column - horizontalDirection].piece!;
    board[to.row][to.column - horizontalDirection].piece = undefined;
    board[to.row][to.column + (horizontalDirection === 2 ? 1 : -1)].piece = rook;
  }
}
