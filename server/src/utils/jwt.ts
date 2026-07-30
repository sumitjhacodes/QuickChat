import jwt from "jsonwebtoken";

export const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

export const generateJWTToken = (payload: string | object | Buffer) => {
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: "15m",
  });
};

export const verifyJWTToken = (token: string) => {
  return jwt.verify(token, getJWTSecret());
};
