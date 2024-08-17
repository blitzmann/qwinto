import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FailedRowComponent } from './failed-row.component';

describe('FailedRowComponent', () => {
  let component: FailedRowComponent;
  let fixture: ComponentFixture<FailedRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FailedRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FailedRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
