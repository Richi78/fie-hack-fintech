import type { UserRole } from "./user.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        email?: string;
        name?: string;
        role?: UserRole;
      };
    }
  }
}

export {};
