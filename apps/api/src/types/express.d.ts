export type UserRole = 'guest' | 'user' | 'creator' | 'moderator' | 'admin';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    }
    interface Request {
      deviceId?: string;
      csrfToken?: string;
    }
    interface ParamsDictionary {
      [key: string]: string;
    }
  }
}

export {};
