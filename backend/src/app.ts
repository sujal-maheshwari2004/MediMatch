import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// error handling middleware
app.use(errorHandler);

export default app;
