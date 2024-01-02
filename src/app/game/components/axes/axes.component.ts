import {Component} from '@angular/core';
import {NgTemplateOutlet} from "@angular/common";

@Component({
  selector: 'axes',
  standalone: true,
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './axes.component.html',
  styleUrl: './axes.component.scss'
})
export class AxesComponent {

}
