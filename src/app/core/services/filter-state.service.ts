import { Injectable, signal, computed } from '@angular/core';

export interface CourseFilters {
  userId?: number;
  campusId?: number;
  period?: string;
}

/**
 * Service to manage and share filter state between FilterPanel and ContentPanel components.
 * Uses Angular signals for reactive state management.
 */
@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private readonly userIdSignal = signal<number | undefined>(undefined);
  private readonly campusIdSignal = signal<number | undefined>(undefined);
  private readonly periodSignal = signal<string | undefined>(undefined);

  readonly filters = computed<CourseFilters>(() => ({
    userId: this.userIdSignal(),
    campusId: this.campusIdSignal(),
    period: this.periodSignal()
  }));

  readonly userId = this.userIdSignal.asReadonly();
  readonly campusId = this.campusIdSignal.asReadonly();
  readonly period = this.periodSignal.asReadonly();

  setUserId(userId: number | undefined): void {
    this.userIdSignal.set(userId);
    console.log('[FilterStateService] User ID set to:', userId);
  }

  setCampusId(campusId: number | undefined): void {
    this.campusIdSignal.set(campusId);
    console.log('[FilterStateService] Campus ID set to:', campusId);
  }

  setPeriod(period: string | undefined): void {
    this.periodSignal.set(period);
    console.log('[FilterStateService] Period set to:', period);
  }

  clearFilters(): void {
    this.userIdSignal.set(undefined);
    this.campusIdSignal.set(undefined);
    this.periodSignal.set(undefined);
    console.log('[FilterStateService] All filters cleared');
  }

  hasActiveFilters(): boolean {
    return this.userIdSignal() !== undefined || 
      this.campusIdSignal() !== undefined || 
      this.periodSignal() !== undefined;
  }
}
