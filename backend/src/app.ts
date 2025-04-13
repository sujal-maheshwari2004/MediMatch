import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";

import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import adminRoutes from "./routes/adminRoutes";
import { setupSwagger } from "./utils/swagger";

const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:5500" }));

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());

// Setup Swagger
setupSwagger(app);

// routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/doctor", doctorRoutes);
app.use("/api/v1/admin", adminRoutes);

// error handling middleware
app.use(errorHandler);

export default app;
