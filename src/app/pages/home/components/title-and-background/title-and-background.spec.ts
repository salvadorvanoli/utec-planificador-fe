import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleAndBackground } from './title-and-background';

describe('TitleAndBackground', () => {
  let component: TitleAndBackground;
  let fixture: ComponentFixture<TitleAndBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleAndBackground]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleAndBackground);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
