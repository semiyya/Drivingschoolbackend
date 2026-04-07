// import dotenv from 'dotenv'
// import pkg from 'jsonwebtoken'
// const { verify } = pkg
// dotenv.config()

// export default function Auth(req, res, next) {
//   try {
//     const key = req.headers.authorization// take authorization from headers
//     if (!key) {
//       return res.status(401).send("unauthorized access")
//     }

//     const token = key.split(" ")[1]
//     const auth = verify(token, process.env.JWT_SECRET)
//     req.user = auth
//     next()

//   } catch (error) {
//     return res.status(500).send(error)
//   }
// }
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔐 JWT Authentication Middleware
 * Checks if user is logged in
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized access, token missing"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
      decoded = {
        id: user._id,
        role: user.role,
        iat,
        exp
      }
    */

    // Attach user data to request
    req.user = decoded;
    req.user.id = decoded.userId; // ⬅️ Supporting both ways

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, invalid token"
    });
  }
};

/**
 * 🔒 Role-Based Authorization Middleware
 * Usage: authorizeRoles("admin", "instructor")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permission"
      });
    }
    next();
  };
};
