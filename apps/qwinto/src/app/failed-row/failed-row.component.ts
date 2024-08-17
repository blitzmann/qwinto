import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntryComponent } from '../entry/entry.component';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { selectMyPlayer } from '../store/reducers';

@Component({
  selector: 'app-failed-row',
  standalone: true,
  imports: [CommonModule, EntryComponent],
  templateUrl: './failed-row.component.html',
  styleUrl: './failed-row.component.css',
})
export class FailedRowComponent {
  data$ = combineLatest({
    player: this.store.select(selectMyPlayer),
  });

  constructor(private store: Store) {}
}
