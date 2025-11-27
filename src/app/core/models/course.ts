import { CurricularUnit } from './curricular-unit';
import { Teacher } from './teacher';
import { WeeklyPlanning } from './weekly-planning';
import { Modification } from './modification';
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
  curricularUnit: CurricularUnit;
  teachers?: Teacher[];
  weeklyPlannings?: WeeklyPlanning[];
  modifications?: Modification[];
}

export interface CourseBasicResponse {
  id: number;
  description: string;
  startDate: string;
  endDate: string;
  curricularUnitName: string;
  teachers: UserBasicResponse[];
  lastModificationDate: string | null;
}

export interface CourseDetailedInfo {
  courseId: number;
  programName: string;
  curricularUnitName: string;
  teachers: {
    name: string;
    lastName: string;
    email: string;
  }[];
  credits: number;
  semesterNumber: number;
  domainAreas: string[];
  professionalCompetencies: string[];
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
  weeklyPlannings?: {
    weekNumber: number;
    startDate: string;
    endDate: string;
    contentTitles: string[];
    bibliographicReferences: string[];
  }[];
  bibliography?: string[];
}

export interface MyCourseSummary {
  id: number;
  curricularUnitName: string;
  startDate: string;
  shift: string;
}

export interface TeacherPastCourse {
  courseId: number;
  displayName: string;
  curricularUnitName: string;
  period: string;
  campusName: string;
  teacherId: number;
}
