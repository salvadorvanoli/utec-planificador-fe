import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EnumResponse {
  value: string;
  displayValue: string;
}

export interface AllEnumsResponse {
  [key: string]: EnumResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class EnumService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/enums`;

  /**
   * Returns a map with all enumerations available in the system
   * @returns Observable with all enums grouped by type
   */
  getAllEnums(): Observable<AllEnumsResponse> {
    return this.http.get<AllEnumsResponse>(this.apiUrl);
  }

  /**
   * Returns the list of available domain areas
   * @returns Observable with domain areas list
   */
  getDomainAreas(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/domain-areas`);
  }

  /**
   * Returns the list of available cognitive processes
   * @returns Observable with cognitive processes list
   */
  getCognitiveProcesses(): Observable<EnumResponse[]> {
    console.log('[EnumService] Fetching cognitive processes from:', `${this.apiUrl}/cognitive-processes`);
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/cognitive-processes`).pipe(
      tap(data => console.log('[EnumService] Cognitive processes received:', data))
    );
  }

  /**
   * Returns the list of available shifts
   * @returns Observable with shifts list
   */
  getShifts(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/shifts`);
  }

  /**
   * Returns the list of available delivery formats
   * @returns Observable with delivery formats list
   */
  getDeliveryFormats(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/delivery-formats`);
  }

  /**
   * Returns the list of available transversal competencies
   * @returns Observable with transversal competencies list
   */
  getTransversalCompetencies(): Observable<EnumResponse[]> {
    console.log('[EnumService] Fetching transversal competencies from:', `${this.apiUrl}/transversal-competencies`);
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/transversal-competencies`).pipe(
      tap((data: EnumResponse[]) => console.log('[EnumService] Transversal competencies received:', data))
    );
  }

  /**
   * Returns the list of available partial grading systems
   * @returns Observable with partial grading systems list
   */
  getPartialGradingSystems(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/partial-grading-systems`);
  }

  /**
   * Returns the list of available professional competencies
   * @returns Observable with professional competencies list
   */
  getProfessionalCompetencies(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/professional-competencies`);
  }

  /**
   * Returns the list of available sustainable development goals (SDGs)
   * @returns Observable with SDGs list
   */
  getSustainableDevelopmentGoals(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/sustainable-development-goals`);
  }

  /**
   * Returns the list of available teaching strategies
   * @returns Observable with teaching strategies list
   */
  getTeachingStrategies(): Observable<EnumResponse[]> {
    console.log('[EnumService] Fetching teaching strategies from:', `${this.apiUrl}/teaching-strategies`);
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/teaching-strategies`).pipe(
      tap((data: EnumResponse[]) => console.log('[EnumService] Teaching strategies received:', data))
    );
  }

  /**
   * Returns the list of available learning modalities
   * @returns Observable with learning modalities list
   */
  getLearningModalities(): Observable<EnumResponse[]> {
    console.log('[EnumService] Fetching learning modalities from:', `${this.apiUrl}/learning-modalities`);
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/learning-modalities`).pipe(
      tap((data: EnumResponse[]) => console.log('[EnumService] Learning modalities received:', data))
    );
  }

  /**
   * Returns the list of available learning resources
   * @returns Observable with learning resources list
   */
  getLearningResources(): Observable<EnumResponse[]> {
    console.log('[EnumService] Fetching learning resources from:', `${this.apiUrl}/learning-resources`);
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/learning-resources`).pipe(
      tap((data: EnumResponse[]) => console.log('[EnumService] Learning resources received:', data))
    );
  }

  /**
   * Returns the list of available Universal Design for Learning (UDL) principles
   * @returns Observable with UDL principles list
   */
  getUniversalDesignLearningPrinciples(): Observable<EnumResponse[]> {
    return this.http.get<EnumResponse[]>(`${this.apiUrl}/universal-design-learning-principles`);
  }
}
