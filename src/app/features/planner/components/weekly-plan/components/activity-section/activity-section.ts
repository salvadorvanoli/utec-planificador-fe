import { Component, AfterViewInit, ChangeDetectionStrategy, signal, input, output } from '@angular/core';
import { ButtonComponent } from '@app/shared/components/button/button';
import { ActivtyBullet } from '../activty-bullet/activty-bullet';
import { AddActivity } from '../../../add-activity/add-activity';
import { Activity } from '@app/core/models';

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
  activities = input<Activity[]>([]);
  showActivities = input<boolean>(false);
  programmaticContentId = input<number | null>(null);
  
  onActivityCreated = output<void>();
  onActivityDeleted = output<number>();
  
  animate = signal<boolean>(false);
  modalVisible = signal(false);
  editingActivityId = signal<number | null>(null);
  
  ngAfterViewInit(): void {
    setTimeout(() => this.animate.set(true), 60);
  }

  openModal(): void {
    console.log('[ActivitySection] openModal called - Create mode');
    this.editingActivityId.set(null);
    this.modalVisible.set(true);
  }
  
  handleActivityCreated(): void {
    console.log('[ActivitySection] Activity created/updated, notifying parent');
    this.onActivityCreated.emit();
  }
  
  handleDelete(activityId: number): void {
    console.log('[ActivitySection] Delete requested for activity:', activityId);
    this.onActivityDeleted.emit(activityId);
  }
  
  handleEdit(activityId: number): void {
    console.log('[ActivitySection] Edit requested for activity:', activityId);
    this.editingActivityId.set(activityId);
    this.modalVisible.set(true);
  }
}
