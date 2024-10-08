import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
})
export class EntryComponent {
  @Input() bonus: boolean | undefined = false;
  @Input() enabled: boolean | undefined = false;
  @Input() value: number | null = null;
  @Input() failed: boolean = false;
}
