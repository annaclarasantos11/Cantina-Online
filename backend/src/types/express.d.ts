import type { TokenClaims } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: (TokenClaims & { id?: number });
      token?: string;
      userId?: number;
    }
  }
}

export {};
