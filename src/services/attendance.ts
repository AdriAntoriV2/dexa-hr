import { apiRequest } from './api';
import type {
  AttendanceOverviewParams,
  AttendanceOverviewResponse,
} from '../types/attendance';

export function getAttendanceOverview(
  params: AttendanceOverviewParams = {},
) {
  const query = new URLSearchParams();

  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);

  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 10));

  return apiRequest<AttendanceOverviewResponse>(
    `/attendance/employees/history?${query.toString()}`,
  );
}