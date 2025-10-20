import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekTitle } from './week-title';

describe('WeekTitle', () => {
  let component: WeekTitle;
  let fixture: ComponentFixture<WeekTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekTitle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekTitle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
