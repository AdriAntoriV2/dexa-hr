import { apiRequest } from './api';
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from '../types/employee';

export function getEmployees() {
  return apiRequest<Employee[]>('/employees');
}

export function createEmployee(payload: CreateEmployeePayload) {
  return apiRequest<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload,
) {
  return apiRequest<Employee>(`/employees/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}