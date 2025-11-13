export interface ChatRequest {
  message: string;
  courseId?: number;
}

export interface ChatResponse {
  reply: string;
}

export interface SuggestionsRequest {
  courseId: number;
}

export interface SuggestionsResponse {
  analysis: string;
  pedagogicalSuggestions: string;
}

export interface ReportRequest {
  courseId: number;
}

export interface CourseReport {
  courseId: string;
  analysisDate: string;
  overallRating: string;
  score: string;
  message: string;
  executiveSummary: ExecutiveSummary;
  detailedAnalysis: DetailedAnalysis;
  strengths: string[];
  improvementAreas: string[];
}

export interface ExecutiveSummary {
  totalWeeks: number;
  totalHours: number;
  inPersonHours: number;
  virtualHours: number;
  hybridHours: number;
  averageActivityDuration: string;
  totalActivitiesAnalyzed: number;
}

export interface DetailedAnalysis {
  cognitiveProcesses: string;
  transversalCompetencies: string;
  modalityBalance: string;
  teachingStrategies: string;
  resources: string;
  sdgLinkage: string;
}

export interface ReportResponse {
  success: boolean;
  report: CourseReport;
  recommendations: string[];
  overallRating: string;
}

export interface ChatMessage {
  text: string;
  isBot: boolean;
  timestamp: Date;
  inProgress?: boolean;
}

export interface ClearSessionResponse {
  message: string;
}

