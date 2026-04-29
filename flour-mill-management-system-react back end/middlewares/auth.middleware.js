import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Security Check: Ensure JWT_SECRET is set in production
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET is not defined in environment variables.');
}

/**
 * Middleware to require a valid JWT token.
 * Attaches userId and userRole to the request object.
 */
export const requireAuth = (req, _res, next) => {
  try {
    const auth = req.headers.authorization || "";
    // Extract token from "Bearer <token>"
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) throw new Error("Missing token");

    // Verify token signature
    const payload = jwt.verify(token, JWT_SECRET || "devsecret"); // Fallback only for local dev if strictly needed

    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch (err) {
    return _res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.userRole || req.userRole !== role) return res.status(403).json({ message: "Forbidden" });
  next();
};

export const requireRoles = (roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) return res.status(403).json({ message: "Forbidden" });
  next();
};
