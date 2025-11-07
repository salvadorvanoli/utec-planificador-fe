import { UserPosition } from './user';
import { Course } from './course';

export interface Teacher extends UserPosition {
  courses?: Course[];
}
