export type AttendanceTimingStatus = 'EARLY' | 'ON_TIME' | 'LATE';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee: {
    companyEmail: string;
    fullName: string;
  };
  attendanceDate: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInStatus: AttendanceTimingStatus | null;
  checkOutStatus: AttendanceTimingStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceOverviewResponse {
  data: AttendanceRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AttendanceOverviewParams {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}