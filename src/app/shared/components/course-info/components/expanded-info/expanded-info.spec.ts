import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandedInfo } from './expanded-info';

describe('ExpandedInfo', () => {
  let component: ExpandedInfo;
  let fixture: ComponentFixture<ExpandedInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandedInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandedInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
