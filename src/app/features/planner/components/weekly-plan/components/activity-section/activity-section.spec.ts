import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitySection } from './activity-section';

describe('ActivitySection', () => {
  let component: ActivitySection;
  let fixture: ComponentFixture<ActivitySection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitySection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivitySection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
