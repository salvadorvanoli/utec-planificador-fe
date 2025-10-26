import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivtyBullet } from './activty-bullet';

describe('ActivtyBullet', () => {
  let component: ActivtyBullet;
  let fixture: ComponentFixture<ActivtyBullet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivtyBullet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivtyBullet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
