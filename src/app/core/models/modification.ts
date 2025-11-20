import { Course } from './course';
import { User } from './user';

export type ModificationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Modification {
  id: number;
  modificationDate: string;
  description: string;
  type: ModificationType;
  teacherId: number;
  teacherName: string;
  courseId: number;
  course?: Course;
  modifiedBy?: User;
}

export interface ModificationPageResponse {
  content: Modification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
