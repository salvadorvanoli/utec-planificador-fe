export interface OfficeHours {
  id: number;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  courseId: number;
}

export interface OfficeHoursRequest {
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  courseId: number;
}

export interface OfficeHoursResponse {
  id: number;
  date: string;
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  courseId: number;
}
