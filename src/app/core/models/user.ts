import { Position } from "./position";

export interface PersonalData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface User {
  id: number;
  utecEmail: string;
  personalData: PersonalData;
  authProvider: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  positions?: UserPosition[];
}

export interface UserPosition {
  id: number;
  role: string;
  isActive: boolean;
  user?: User;
}

export interface UserPositionsResponse {
  userId: number;
  email: string;
  fullName: string;
  positions: Position[];
}

export interface UserBasicResponse {
  id: number;
  fullName: string;
  email: string;
}
