import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-entry-row',
  templateUrl: './entry-row.component.html',
  styleUrls: ['./entry-row.component.scss'],
})
export class EntryRowComponent {
  @Input() entries;
}
