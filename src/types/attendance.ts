export type AttendanceTimingStatus = 'EARLY' | 'ON_TIME' | 'LATE';

export interface AttendanceRecord {
    id: string;
    attendanceDate: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    checkInStatus: AttendanceTimingStatus | null;
    checkOutStatus: AttendanceTimingStatus | null;
    employee: {
        id: string;
        fullName: string;
        companyEmail: string;
        photoUrl: string | null;
    };
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