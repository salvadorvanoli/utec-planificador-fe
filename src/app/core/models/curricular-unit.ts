import { TermResponse } from './term';

export interface CurricularUnitResponse {
  id: number;
  name: string;
  credits: number;
  domainAreas: string[];
  professionalCompetencies: string[];
  term: TermResponse;
}
