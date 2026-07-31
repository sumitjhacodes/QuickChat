import jwt from "jsonwebtoken";

export interface AuthJwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return secret;
};

export const generateJWTToken = (payload: AuthJwtPayload): string => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  });
};

export const verifyJWTToken = (token: string): AuthJwtPayload => {
  const payload = jwt.verify(token, getJWTSecret());

  if (typeof payload === "string" || !payload.id) {
    throw new Error("Invalid token payload");
  }

  return payload as AuthJwtPayload;
};
