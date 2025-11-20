import { Injectable, signal, computed } from '@angular/core';

export interface CourseFilters {
  userId?: number;
  campusId?: number;
  period?: string;
  searchText?: string;
}

export interface PermanentFilters {
  campusId?: number;
  userId?: number;
}

/**
 * Service to manage and share filter state between FilterPanel and ContentPanel components.
 * Uses Angular signals for reactive state management.
 * Supports permanent filters that cannot be modified by users (campus and teacher filters).
 */
@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private readonly userIdSignal = signal<number | undefined>(undefined);
  private readonly campusIdSignal = signal<number | undefined>(undefined);
  private readonly periodSignal = signal<string | undefined>(undefined);
  private readonly searchTextSignal = signal<string | undefined>(undefined);

  // Permanent filters that cannot be cleared or modified once set
  private readonly permanentCampusId = signal<number | undefined>(undefined);
  private readonly permanentUserId = signal<number | undefined>(undefined);

  readonly filters = computed<CourseFilters>(() => ({
    userId: this.userIdSignal(),
    campusId: this.campusIdSignal(),
    period: this.periodSignal(),
    searchText: this.searchTextSignal()
  }));

  readonly userId = this.userIdSignal.asReadonly();
  readonly campusId = this.campusIdSignal.asReadonly();
  readonly period = this.periodSignal.asReadonly();
  readonly searchText = this.searchTextSignal.asReadonly();

  readonly permanentFilters = computed<PermanentFilters>(() => ({
    campusId: this.permanentCampusId(),
    userId: this.permanentUserId()
  }));

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

  setSearchText(searchText: string | undefined): void {
    this.searchTextSignal.set(searchText);
    console.log('[FilterStateService] Search text set to:', searchText);
  }

  /**
   * Sets permanent filters that cannot be cleared by the user.
   * These filters are enforced based on the user's context and mode.
   */
  setPermanentFilters(filters: PermanentFilters): void {
    if (filters.campusId !== undefined) {
      this.permanentCampusId.set(filters.campusId);
      this.campusIdSignal.set(filters.campusId);
      console.log('[FilterStateService] Permanent Campus ID set to:', filters.campusId);
    }
    if (filters.userId !== undefined) {
      this.permanentUserId.set(filters.userId);
      this.userIdSignal.set(filters.userId);
      console.log('[FilterStateService] Permanent User ID set to:', filters.userId);
    }
  }

  /**
   * Validates that permanent filters have not been tampered with.
   * Returns true if filters are valid, false if they have been compromised.
   */
  validatePermanentFilters(): boolean {
    const permCampus = this.permanentCampusId();
    const permUser = this.permanentUserId();
    const currentCampus = this.campusIdSignal();
    const currentUser = this.userIdSignal();

    // If permanent campus is set, current campus must match
    if (permCampus !== undefined && currentCampus !== permCampus) {
      console.error('[FilterStateService] SECURITY VIOLATION: Campus filter tampered!', {
        permanent: permCampus,
        current: currentCampus
      });
      return false;
    }

    // If permanent user is set, current user must match
    if (permUser !== undefined && currentUser !== permUser) {
      console.error('[FilterStateService] SECURITY VIOLATION: User filter tampered!', {
        permanent: permUser,
        current: currentUser
      });
      return false;
    }

    return true;
  }

  clearFilters(): void {
    // Clear only non-permanent filters
    this.periodSignal.set(undefined);
    this.searchTextSignal.set(undefined);
    
    // Restore permanent filters if they were set
    const permCampus = this.permanentCampusId();
    const permUser = this.permanentUserId();
    
    if (permCampus !== undefined) {
      this.campusIdSignal.set(permCampus);
    } else {
      this.campusIdSignal.set(undefined);
    }
    
    if (permUser !== undefined) {
      this.userIdSignal.set(permUser);
    } else {
      this.userIdSignal.set(undefined);
    }
    
    console.log('[FilterStateService] Non-permanent filters cleared');
  }

  clearAllFilters(): void {
    // Clear all filters including permanent ones (used on navigation away)
    this.userIdSignal.set(undefined);
    this.campusIdSignal.set(undefined);
    this.periodSignal.set(undefined);
    this.searchTextSignal.set(undefined);
    this.permanentCampusId.set(undefined);
    this.permanentUserId.set(undefined);
    console.log('[FilterStateService] All filters (including permanent) cleared');
  }

  /**
   * Checks if there are active non-permanent filters.
   * This is useful for determining if the "Clear filters" button should be enabled.
   * @returns true if there are non-permanent filters active
   */
  hasActiveNonPermanentFilters(): boolean {
    const permCampus = this.permanentCampusId();
    const permUser = this.permanentUserId();
    const currentCampus = this.campusIdSignal();
    const currentUser = this.userIdSignal();
    const currentPeriod = this.periodSignal();
    const currentSearchText = this.searchTextSignal();

    // Check if period or searchText are set (always non-permanent)
    if (currentPeriod !== undefined || currentSearchText !== undefined) {
      return true;
    }

    // Check if campus is set and is NOT a permanent filter
    if (currentCampus !== undefined && permCampus === undefined) {
      return true;
    }

    // Check if user is set and is NOT a permanent filter
    if (currentUser !== undefined && permUser === undefined) {
      return true;
    }

    return false;
  }

  hasPermanentFilters(): boolean {
    return this.permanentCampusId() !== undefined || this.permanentUserId() !== undefined;
  }
}
