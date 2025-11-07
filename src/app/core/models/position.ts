export interface RegionalTechnologicalInstitute {
  id: number;
  name: string;
}

export interface Campus {
  id: number;
  name: string;
  regionalTechnologicalInstitute: RegionalTechnologicalInstitute;
}

export interface Position {
  id: number;
  type: string;
  role: string;
  regionalTechnologicalInstitute: RegionalTechnologicalInstitute;
  campuses: Campus[];
  isActive: boolean;
}

export interface UserPositionsResponse {
  userId: number;
  email: string;
  fullName: string;
  positions: Position[];
}

export interface SelectedContext {
  itr: RegionalTechnologicalInstitute;
  campus: Campus;
  roles: string[];
}

