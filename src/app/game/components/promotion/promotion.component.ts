import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Piece} from "../../domain/model/piece";
import {PieceType} from "../../domain/model/piece-type";

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
  styleUrl: './promotion.component.scss'
})
export class PromotionComponent {
  constructor(
    public dialogRef: MatDialogRef<PromotionComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: Piece,
  ) {}

  onNoClick(): void {
    // this.data.type = PieceType.QUEEN;
    this.dialogRef.close();
  }

  protected readonly PieceType = PieceType;
}
