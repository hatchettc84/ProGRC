import { Request } from 'express';

export interface UserData {
  userId: string;
  customerId: string;
  email?: string;
  role_id?: number | string;
  tenant_id?: string;
  impersonateExpTime?: number;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user_data: UserData;
}

