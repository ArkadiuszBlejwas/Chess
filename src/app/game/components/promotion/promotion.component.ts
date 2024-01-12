import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {PieceType} from "../../model/piece-type";
import {PieceColor} from "../../model/piece-color";

@Component({
  selector: 'promotion',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionComponent {

  protected readonly PieceType = PieceType;

  pieceColor!: PieceColor;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PieceColor) {
    this.pieceColor = data;
  }

  getPieceImageSrc(pieceType: PieceType, color: PieceColor): string {
    return 'assets/pieces/cardinal/' + this.getPieceFileImage(pieceType, color);
  }

  private getPieceFileImage(pieceType: PieceType, color: PieceColor): string {
    return this.getColorLetter(color) + this.getPieceTypeSVG(pieceType);
  }

  private getColorLetter(pieceColor: PieceColor): string {
    if (pieceColor === PieceColor.WHITE) {
      return 'w';
    }
    else {
      return 'b';
    }
  }

  private getPieceTypeSVG(pieceType?: PieceType): string {
    switch (pieceType) {
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
}
