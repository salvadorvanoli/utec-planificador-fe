import { Position } from './user';
import { Course } from './course';

export interface Teacher extends Position {
  courses?: Course[];
}
