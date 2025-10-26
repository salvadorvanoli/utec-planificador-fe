import { Component, AfterViewInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CardContainer } from '../card-container/card-container';
import { ActivityCard } from '../activity-card/activity-card';
import { ContentCard } from '../content-card/content-card';
import { ButtonComponent } from '@app/shared/components/button/button';
import { ActivtyBullet } from '../activty-bullet/activty-bullet';
import { AddActivity } from '../../../add-activity/add-activity';

@Component({
  selector: 'app-activity-section',
  imports: [ ButtonComponent, ActivtyBullet, AddActivity],
  templateUrl: './activity-section.html',
  styleUrls: ['./activity-section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.animated]': 'animate()' 
  }
})
export class ActivitySection implements AfterViewInit {
  animate = signal<boolean>(false);
  modalVisible = signal(false);
  
  ngAfterViewInit(): void {
    setTimeout(() => this.animate.set(true), 60);
  }

  openModal(): void {

    console.log('openModal called');
    this.modalVisible.set(true);
  }

}
