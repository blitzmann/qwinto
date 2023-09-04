import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DieSelectionComponent } from './die-selection.component';

describe('DieSelectionComponent', () => {
  let component: DieSelectionComponent;
  let fixture: ComponentFixture<DieSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DieSelectionComponent],
    });
    fixture = TestBed.createComponent(DieSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
