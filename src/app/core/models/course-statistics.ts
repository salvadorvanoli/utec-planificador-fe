export interface CourseStatistics {
  cognitiveProcesses: Record<string, number>;
  transversalCompetencies: Record<string, number>;
  learningModalities: Record<string, number>;
  teachingStrategies: Record<string, number>;
  mostUsedResources: string[];
  linkedSDGs: Record<string, number>;
  averageActivityDurationInMinutes: number;
  totalWeeks: number;
  totalInPersonHours: number;
  totalVirtualHours: number;
  totalHybridHours: number;
}
