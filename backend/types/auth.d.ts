import { Request } from 'express';

// JWT Payload interface
export interface IJwtPayload extends jwt.JwtPayload {
  userId: string; // Use userId in JWT to avoid confusion with _id
  email: string;
  isAdmin: boolean;
}

// Authenticated User (JWT token payload)
export interface IAuthenticatedUser {
  _id: string;
  email: string;
  isAdmin: boolean;
}

// Extended Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: IAuthenticatedUser; // req.user is of type IAuthenticatedUser
}
