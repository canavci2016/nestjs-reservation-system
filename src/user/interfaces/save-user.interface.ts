export interface SaveUser {
  name: string;
  lastName: string;
  userName: string;
  password: string;
  companyId: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}
