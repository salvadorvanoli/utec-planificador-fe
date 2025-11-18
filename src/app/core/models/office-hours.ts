export interface OfficeHours {
  id: number;
  date: string; // Format: YYYY-MM-DD
  startHour: number;
  endHour: number;
  courseId: number;
}

export interface OfficeHoursRequest {
  date: string; // Format: YYYY-MM-DD
  startHour: number;
  endHour: number;
  courseId: number;
}

export interface OfficeHoursResponse {
  id: number;
  date: string;
  startHour: number;
  endHour: number;
  courseId: number;
}
