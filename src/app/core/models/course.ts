import { CurricularUnitResponse } from './curricular-unit';
import { UserBasicResponse } from './user';

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
  curricularUnit: CurricularUnitResponse;
  teachers: UserBasicResponse[];
}

export interface CourseBasicResponse {
  id: number;
  shift: string;
  description: string;
  startDate: string;
  endDate: string;
  curricularUnitName: string;
  termName: string;
  programName: string;
  teachers: UserBasicResponse[];
  lastModificationDate: string | null;
}

export interface CourseRequest {
  shift: string; // Required
  description?: string; // Optional
  startDate: string; // Required
  endDate: string; // Required
  partialGradingSystem?: string; // Optional
  hoursPerDeliveryFormat?: Record<string, number>; // Optional
  isRelatedToInvestigation?: boolean; // Optional
  involvesActivitiesWithProductiveSector?: boolean; // Optional
  sustainableDevelopmentGoals?: string[]; // Optional
  universalDesignLearningPrinciples?: string[]; // Optional
  curricularUnitId: number; // Required
  userIds: number[]; // Required
}

export interface PeriodResponse {
  period: string;
}

export interface CoursePdfData {
  description: string;
  startDate: string;
  endDate: string;
  shift: string;
  involvesActivitiesWithProductiveSector: boolean;
  partialGradingSystem: string;
  isRelatedToInvestigation: boolean;
  hoursPerDeliveryFormat: Record<string, number>;
  teachers: {
    name: string;
    lastName: string;
    email: string;
  }[];
  programName: string;
  curricularUnit: {
    name: string;
    credits: number;
  };
}

export interface MyCourseSummary {
  id: number;
  curricularUnitName: string;
  startDate: string;
  shift: string;
}
