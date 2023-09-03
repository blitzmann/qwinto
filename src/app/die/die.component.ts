import { Component, Input } from '@angular/core';

export type dieColors = 'purple' | 'yellow' | 'orange';
@Component({
  selector: 'app-die',
  templateUrl: './die.component.html',
  styleUrls: ['./die.component.scss'],
})
export class DieComponent {
  @Input() value!: number;
  @Input() color!: dieColors;
}
