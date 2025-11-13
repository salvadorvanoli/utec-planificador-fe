import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatRequest,
  ChatResponse,
  SuggestionsRequest,
  SuggestionsResponse,
  ReportRequest,
  ReportResponse,
  ClearSessionResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AiAgentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ai-agent`;

  /**
   * Sends a message to the AI chatbot
   * @param request Chat request with message and optional courseId
   * @returns Observable with the AI response
   */
  chat(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request, {
      withCredentials: true
    });
  }

  /**
   * Clears the current user's chat session
   * @returns Observable indicating success
   */
  clearChatSession(): Observable<ClearSessionResponse> {
    return this.http.delete<ClearSessionResponse>(`${this.apiUrl}/chat/session`, {
      withCredentials: true
    });
  }

  /**
   * Gets pedagogical suggestions for a course
   * @param request Suggestions request with courseId
   * @returns Observable with analysis and suggestions
   */
  getSuggestions(request: SuggestionsRequest): Observable<SuggestionsResponse> {
    return this.http.post<SuggestionsResponse>(`${this.apiUrl}/suggestions`, request, {
      withCredentials: true
    });
  }

  /**
   * Generates a quality report for a course
   * @param request Report request with courseId
   * @returns Observable with the detailed report
   */
  generateReport(request: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.apiUrl}/report`, request, {
      withCredentials: true
    });
  }
}

