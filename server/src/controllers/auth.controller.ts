import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/user.models.js";
import { generateJWTToken } from "../utils/jwt.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000,
};

const signupSchema = z.object({
  username: z.string().trim().min(3).max(30),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const createAuthToken = (userId: string) => {
  return generateJWTToken({ id: userId });
};

const formatUserResponse = (user: {
  id: string;
  username: string;
  email: string;
  status: boolean;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  status: user.status,
});

export const signup = async (req: Request, res: Response) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid username, email, and password.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { username, email, password } = parsed.data;
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "Email or username is already in use.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    const token = createAuthToken(user.id);

    return res
      .status(201)
      .cookie("token", token, COOKIE_OPTIONS)
      .json({
        status: "success",
        message: "Signup completed successfully.",
        data: {
          user: formatUserResponse(user),
          token,
        },
      });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed.";
    return res.status(500).json({ status: "error", message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid email and password.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
      });
    }

    const token = createAuthToken(user.id);

    return res
      .status(200)
      .cookie("token", token, COOKIE_OPTIONS)
      .json({
        status: "success",
        message: "Login successful.",
        data: {
          user: formatUserResponse(user),
          token,
        },
      });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return res.status(500).json({ status: "error", message });
  }
};

export const logout = (_req: Request, res: Response) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ status: "success", message: "Logout successful." });
};
