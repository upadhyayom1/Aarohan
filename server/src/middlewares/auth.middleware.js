import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token missing or invalid',
      details: {},
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'aarohan_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token expired or invalid',
      details: {},
    });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token missing or invalid',
        details: {},
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `Forbidden: requires one of [${allowedRoles.join(', ')}] role`,
        details: {},
      });
    }

    next();
  };
}

