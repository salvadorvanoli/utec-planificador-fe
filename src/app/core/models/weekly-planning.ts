export interface WeeklyPlanning {
  id: number;
  weekNumber: number;
  startDate: string; // LocalDate from backend
  endDate: string; // LocalDate from backend
  bibliographicReferences: string[];
  programmaticContents?: ProgrammaticContent[];
}

export interface ProgrammaticContent {
  id: number;
  title: string;
  content: string;
  color: string;
  weeklyPlanning?: WeeklyPlanning;
  activities?: Activity[];
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  color: string;
  durationInMinutes: number;
  cognitiveProcesses: string[]; 
  transversalCompetencies: string[]; 
  learningModality: string;
  teachingStrategies: string[]; 
  learningResources: string[]; 
  programmaticContent?: ProgrammaticContent;
}
