import {Component, Input} from '@angular/core';
import {PieceType} from "../../board/domain/model/piece-type";
import {PieceColor} from "../../board/domain/model/piece-color";

@Component({
  selector: 'piece',
  standalone: true,
  imports: [],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss'
})
export class PieceComponent {

  @Input()
  pieceType!: PieceType;

  @Input()
  color!: PieceColor;

  get image(): string {
    if (this.color === PieceColor.WHITE) {
      switch (this.pieceType) {
        case PieceType.ROOK:
          return 'wr.svg';
        case PieceType.KNIGHT:
          return 'wn.svg';
        case PieceType.BISHOP:
          return 'wb.svg';
        case PieceType.QUEEN:
          return 'wq.svg';
        case PieceType.KING:
          return 'wk.svg';
        case PieceType.PAWN:
          return 'wp.svg';
      }
    }
    if (this.color === PieceColor.BLACK) {
      switch (this.pieceType) {
        case PieceType.ROOK:
          return 'br.svg';
        case PieceType.KNIGHT:
          return 'bn.svg';
        case PieceType.BISHOP:
          return 'bb.svg';
        case PieceType.QUEEN:
          return 'bq.svg';
        case PieceType.KING:
          return 'bk.svg';
        case PieceType.PAWN:
          return 'bp.svg';
      }
    }
    return '';
  }
}
