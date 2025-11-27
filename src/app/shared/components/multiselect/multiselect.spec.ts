import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelector } from './multiselect';

describe('Multiselect', () => {
  let component: MultiSelector;
  let fixture: ComponentFixture<MultiSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
