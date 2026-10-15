export type HrNotificationType =
  | 'EMPLOYEE_PROFILE_UPDATED'
  | 'EMPLOYEE_PASSWORD_CHANGED';
  
export interface HrNotification {
  id: string;
  type: HrNotificationType;
  employeeId: string;
  changedFields: string[];
  message: string;
  occurredAt: string;
  readAt: string | null;
}

export interface HrNotificationsResponse {
  data: HrNotification[];
  unreadCount: number;
}