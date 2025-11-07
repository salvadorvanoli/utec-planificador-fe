import { Activity, WeeklyPlanning } from './weekly-planning';

export interface ProgrammaticContent {
  id: number;
  title: string;
  content: string;
  color: string;
  weeklyPlanning?: WeeklyPlanning;
  activities?: Activity[];
}
