import { Component, Input } from '@angular/core';
import { dieColors } from '../../../../../libs/lib/src';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-die',
  templateUrl: './die.component.html',
  styleUrls: ['./die.component.scss'],
})
export class DieComponent {
  @Input() value!: number;
  @Input() color!: dieColors;
}
