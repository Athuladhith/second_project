// types/express.d.ts
import { IAuthenticatedUser } from './path/to/your/types'; // Correct the import path

declare global {
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser; // Add the user property with IAuthenticatedUser type
    }
  }
}
