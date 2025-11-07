import { Course } from './course';
import { User } from './user';

export interface Modification {
  id: number;
  modificationDate: string;
  description: string;
  course?: Course;
  modifiedBy?: User;
}
