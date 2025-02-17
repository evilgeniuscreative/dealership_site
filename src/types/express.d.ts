import { AuthenticatedUser } from '../types';

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
  }
}
