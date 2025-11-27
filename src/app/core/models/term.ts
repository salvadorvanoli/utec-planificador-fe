import { ProgramResponse } from "./program";

export interface TermResponse {
  id: number;
  number: number;
  program: ProgramResponse;
}
