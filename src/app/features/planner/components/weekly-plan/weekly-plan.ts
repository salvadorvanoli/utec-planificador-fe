import { Component, signal, OnInit } from '@angular/core';
import { Container } from './components/container/container';
import { WeekTitle } from './components/week-title/week-title';
import { ContentSection } from './components/content-section/content-section';
import { ActivitySection } from './components/activity-section/activity-section';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-weekly-plan',
  imports: [ Container, WeekTitle, ContentSection, ActivitySection, ProgressSpinnerModule ],
  templateUrl: './weekly-plan.html',
  styleUrl: './weekly-plan.scss'
})
export class WeeklyPlan implements OnInit {
  isLoading = signal(true); 

  ngOnInit() {
    setTimeout(() => this.isLoading.set(false), 2000); 
  }
}
