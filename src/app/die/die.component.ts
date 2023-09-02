import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-die',
  templateUrl: './die.component.html',
  styleUrls: ['./die.component.scss'],
})
export class DieComponent {
  @Input() value!: number;
  @Input() color!: 'purple' | 'yellow' | 'orange';
}
