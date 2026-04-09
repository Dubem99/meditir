import { Role } from './enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        hospitalId: string | null;
      };
      hospitalId?: string;
    }
  }
}

export {};
