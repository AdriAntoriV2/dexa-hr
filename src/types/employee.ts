export type EmployeeRole = 'EMPLOYEE' | 'HR';

export interface Employee {
  id: string;
  companyEmail: string;
  fullName: string;
  photoUrl: string | null;
  position: string;
  phoneNumber: string | null;
  role: EmployeeRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  companyEmail: string;
  password: string;
  fullName: string;
  position: string;
  phoneNumber?: string;
}

export interface UpdateEmployeePayload {
  companyEmail?: string;
  fullName?: string;
  position?: string;
  phoneNumber?: string | null;
  photoUrl?: string | null;
}