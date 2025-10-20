import { Component } from '@angular/core';
import { CardContainer } from '../card-container/card-container';
import { ActivityCard } from '../activity-card/activity-card';
import { ButtonComponent } from '@app/shared/components/button/button';

@Component({
  selector: 'app-content-section',
  imports: [CardContainer, ActivityCard, ButtonComponent],
  templateUrl: './content-section.html',
  styleUrl: './content-section.scss'
})
export class ContentSection {

}
