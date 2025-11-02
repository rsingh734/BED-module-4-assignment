import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        emailVerified: boolean;
        role: string;
        authTime: number;
        issuedAt: number;
        expiresAt: number;
      };
    }
  }
}
