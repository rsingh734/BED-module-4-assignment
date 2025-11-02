import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        // Add other user properties as needed
      };
    }
  }
}
