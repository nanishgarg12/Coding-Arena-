import { z } from "zod";
import User from "../models/User.js";
import { asyncHandler } from "../utils.js";
import { signToken } from "../services/tokenService.js";

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  favoriteLanguage: z.enum(["Java", "C++"]).optional(),
  role: z.enum(["player", "recruiter"]).optional()
});

export const register = asyncHandler(async (req, res) => {
  const payload = registerSchema.parse(req.body);
  const exists = await User.findOne({ $or: [{ email: payload.email }, { username: payload.username }] });
  if (exists) {
    res.status(409);
    throw new Error("Email or username already exists");
  }

  const user = await User.create(payload);
  res.status(201).json({ user: sanitize(user), token: signToken(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  user.lastActiveAt = new Date();
  await user.save();
  res.json({ user: sanitize(user), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitize(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["avatar", "favoriteLanguage", "username"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ user: sanitize(req.user) });
});

function sanitize(user) {
  const object = user.toObject ? user.toObject() : user;
  delete object.password;
  return object;
}
