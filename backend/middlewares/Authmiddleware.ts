import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, IJwtPayload } from '../types/auth';

const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'You are not able to view this page' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Bearer token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const decoded = decodedToken as IJwtPayload;

    // Attach the decoded JWT payload to req.user
    req.user = {
      _id: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };

    next();
  });
};

export default authenticateJWT;
