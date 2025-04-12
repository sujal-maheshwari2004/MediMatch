import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// routes
app.use("/api/v1/auth", authRoutes);

// error handling middleware
app.use(errorHandler);

export default app;
