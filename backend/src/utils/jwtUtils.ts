import jwt from "jsonwebtoken";

const SECRET: jwt.Secret = process.env.JWT_SECRET || "supersecretkey";
const EXPIRES_IN: number = Number(process.env.JWT_EXPIRES_IN) || 3600 * 24;

export function signJwt(payload: object): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
