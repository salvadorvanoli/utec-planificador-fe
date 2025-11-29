import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ExpandedInfo } from './expanded-info';

describe('ExpandedInfo', () => {
  let component: ExpandedInfo;
  let fixture: ComponentFixture<ExpandedInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandedInfo],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
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
