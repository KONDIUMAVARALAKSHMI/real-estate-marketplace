import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';

export const verifyToken = (req, _res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return next(createError(401, 'Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = { userId: decoded.id };
    next();
  } catch (error) {
    next(createError(401, 'Unauthorized'));
  }
};
