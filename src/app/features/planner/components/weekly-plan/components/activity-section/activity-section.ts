import { Component, AfterViewInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CardContainer } from '../card-container/card-container';
import { ActivityCard } from '../activity-card/activity-card';
import { ContentCard } from '../content-card/content-card';
import { ButtonComponent } from '@app/shared/components/button/button';

@Component({
  selector: 'app-activity-section',
  imports: [ ContentCard, ButtonComponent],
  templateUrl: './activity-section.html',
  styleUrls: ['./activity-section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.animated]': 'animate()' /* activa la clase .animated cuando el signal es true */
  }
})
export class ActivitySection implements AfterViewInit {
  animate = signal<boolean>(false);

  ngAfterViewInit(): void {
    setTimeout(() => this.animate.set(true), 60);
  }
}
