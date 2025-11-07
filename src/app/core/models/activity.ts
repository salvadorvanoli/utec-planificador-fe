import { ProgrammaticContent } from './weekly-planning';

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
