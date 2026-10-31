import { verifyToken } from '../utils/token.js';
import prisma from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token missing or expired',
        details: {},
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token missing or expired',
        details: {},
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'User no longer exists',
        details: {},
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Authentication failed',
      details: {},
    });
  }
};

export const authorizeRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: `Access denied. Requires one of: [${allowedRoles.join(', ')}]`,
      details: {},
    });
  }
  next();
};


