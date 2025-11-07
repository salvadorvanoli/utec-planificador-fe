import { CurricularUnit } from './curricular-unit';

export interface Term {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  curricularUnits?: CurricularUnit[];
}
