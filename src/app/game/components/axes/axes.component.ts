import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'axes',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './axes.component.html',
  styleUrl: './axes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AxesComponent {

}
