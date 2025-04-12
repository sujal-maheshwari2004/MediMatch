import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwtUtils";
import AppError from "../utils/AppError";

export interface AuthenticatedRequest extends Request {
  user?: { email: string; role: string };
}

export function authenicateToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    throw new AppError("Unauthorized: No token provided", 401);
  }

  const decoded = verifyJwt(token);

  if (!decoded || !decoded.email || !decoded.role) {
    throw new AppError("Unauthorized: Invalid token", 401);
  }

  req.user = { email: decoded.email, role: decoded.role };
  next();
}

export async function authAsUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user || user.role !== "user") {
    throw new AppError("Unauthorized", 401);
  }

  next();
}

export async function authAsDoctor(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user || user.role !== "doctor") {
    throw new AppError("Unauthorized", 401);
  }

  next();
}

export async function authAsAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user || user.role !== "admin") {
    throw new AppError("Unauthorized", 401);
  }

  next();
}
