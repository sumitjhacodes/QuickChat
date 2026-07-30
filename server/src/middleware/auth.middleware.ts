import { type Request, type Response, type NextFunction } from "express";
import { verifyJWTToken } from "../utils/jwt.js";

const getTokenFromRequest = (req: Request): string | undefined => {
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }

  return authHeader.split(" ")[1];
};

export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      throw new Error("Authorization token is required");
    }

    const payload = verifyJWTToken(token);
    (req as any).user = payload;

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed";

    return res.status(401).json({
      status: "fail",
      message,
    });
  }
};
