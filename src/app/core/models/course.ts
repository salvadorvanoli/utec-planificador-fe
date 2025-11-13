import { CurricularUnit } from './curricular-unit';
import { Teacher } from './teacher';
import { WeeklyPlanning } from './weekly-planning';
import { Modification } from './modification';

export interface Course {
  id: number;
  shift: string;
  description: string;
  startDate: string;
  endDate: string;
  partialGradingSystem: string;
  hoursPerDeliveryFormat: Record<string, number>;
  isRelatedToInvestigation: boolean;
  involvesActivitiesWithProductiveSector: boolean;
  sustainableDevelopmentGoals: string[];
  universalDesignLearningPrinciples: string[];
  curricularUnit: CurricularUnit;
  teachers?: Teacher[];
  weeklyPlannings?: WeeklyPlanning[];
  modifications?: Modification[];
}

export interface CourseResponse {
  id: number;
  shift: string;
  description: string;
  startDate: string;
  endDate: string;
  partialGradingSystem: string;
  hoursPerDeliveryFormat: Record<string, number>;
  isRelatedToInvestigation: boolean;
  involvesActivitiesWithProductiveSector: boolean;
  sustainableDevelopmentGoals: string[];
  universalDesignLearningPrinciples: string[];
  curricularUnitId: number;
}

export interface CourseRequest {
  shift: string;
  description: string;
  startDate: string;
  endDate: string;
  partialGradingSystem: string;
  hoursPerDeliveryFormat: Record<string, number>;
  isRelatedToInvestigation: boolean;
  involvesActivitiesWithProductiveSector: boolean;
  sustainableDevelopmentGoals: string[];
  universalDesignLearningPrinciples: string[];
  curricularUnitId: number;
}

export interface PeriodResponse {
  period: string;
}
