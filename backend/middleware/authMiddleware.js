import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Authentication required"));
  }

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) throw new Error("User not found");
    next();
  } catch (error) {
    res.status(401);
    next(new Error("Invalid or expired token"));
  }
}

export function recruiterOnly(req, res, next) {
  if (req.user?.role === "recruiter" || req.user?.role === "admin") return next();
  res.status(403);
  next(new Error("Recruiter access required"));
}
