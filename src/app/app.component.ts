import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {BoardComponent} from "./board/components/board.component";
import {ChessboardComponent} from "./other/chessboard/chessboard.component";
import {Chessboard2Component} from "./other/chessboard2/chessboard2.component";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BoardComponent, ChessboardComponent, Chessboard2Component, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Chess';
}
