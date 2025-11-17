import { Term } from './term';
import { Course } from './course';

export interface CurricularUnit {
  id: number;
  name: string;
  credits: number;
  domainAreas: string[]; 
  professionalCompetencies: string[]; 
  term: Term;
  courses?: Course[];
}

export interface CurricularUnitResponse {
  id: number;
  name: string;
  credits: number;
  domainAreas: string[];
  professionalCompetencies: string[];
  termId: number;
}


