import jwt, { type SignOptions } from "jsonwebtoken";

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
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "15m";
  const options = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  } as SignOptions;

  return jwt.sign(payload, getJWTSecret(), options);
};

export const verifyJWTToken = (token: string): AuthJwtPayload => {
  const payload = jwt.verify(token, getJWTSecret());

  if (typeof payload === "string" || !payload.id) {
    throw new Error("Invalid token payload");
  }

  return payload as AuthJwtPayload;
};
