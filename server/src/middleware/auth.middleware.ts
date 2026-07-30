import { type Request, type Response, type NextFunction } from "express";
import { verifyJWTToken } from "../utils/jwt.js";

export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("Token does not exist");
    }

    const payload = verifyJWTToken(token);
    (req as any).user = payload;

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed";

    return res.status(401).json({
      status: "Failed",
      message,
    });
  }
};
