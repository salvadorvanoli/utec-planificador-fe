import { Campus } from "./campus";
import { RegionalTechnologicalInstitute } from "./regional-technological-institute";

export interface SelectedContext {
  itr: RegionalTechnologicalInstitute;
  campus: Campus;
  roles: string[];
}
