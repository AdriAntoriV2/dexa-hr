export type UserRole = 'HR' | 'EMPLOYEE';

export interface AuthEmployee {
  id: string;
  companyEmail: string;
  fullName: string;
  photoUrl: string | null;
  position: string;
  phoneNumber: string | null;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  employee: AuthEmployee;
}

export interface CurrentUserResponse {
  id: string;
  role: UserRole;
}
