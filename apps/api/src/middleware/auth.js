import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function bearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/** Require a valid admin JWT. Attaches req.admin = { id, email }. */
export function requireAdmin(req, _res, next) {
  const token = bearer(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Require the shared internal token (used by n8n → api calls). Admin JWT also passes. */
export function requireInternal(req, _res, next) {
  const provided = req.headers['x-internal-token'] || bearer(req);
  if (provided && provided === config.API_INTERNAL_TOKEN) return next();
  return requireAdmin(req, _res, next);
}

export function signAdminToken(admin) {
  return jwt.sign({ sub: String(admin._id), email: admin.email }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}
