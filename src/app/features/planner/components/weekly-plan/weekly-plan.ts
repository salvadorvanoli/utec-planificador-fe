import { Component, signal } from '@angular/core';
import { ActivityCard } from './components/activity-card/activity-card';
import { Container } from './components/container/container';
import { CardContainer } from './components/card-container/card-container';
import { ButtonComponent } from '@app/shared/components/button/button';
import { WeekTitle } from './components/week-title/week-title';
import { ContentSection } from './components/content-section/content-section';
import { ActivitySection } from './components/activity-section/activity-section';
@Component({
  selector: 'app-weekly-plan',
  imports: [ Container, WeekTitle, ContentSection, ActivitySection],
  templateUrl: './weekly-plan.html',
  styleUrl: './weekly-plan.scss'
})
export class WeeklyPlan {
  defecto = signal('valor por defecto');
}
