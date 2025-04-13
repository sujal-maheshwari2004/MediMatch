import { Request, Response } from "express";
import User from "../models/users";
import Doctor from "../models/doctors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import AppError from "../utils/AppError";
import path from "path";
import fs from "fs";
import { UploadedFile } from "express-fileupload";

export async function getDoctorDetails(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const doctorEmail = req.user?.email;

    const doctor = await Doctor.findOne(
      { email: doctorEmail },
      { password: 0 }
    );
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    res.status(200).json({ doctor });
    return;
  } catch (error) {
    throw new AppError("Error fetching doctor details", 500);
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorEmail = req.user?.email;

    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    const users = await User.find(
      { _id: { $in: doctor.patients } },
      { password: 0, _id: 0 }
    );

    res.status(200).json({ users });
    return;
  } catch (error) {
    throw new AppError("Error fetching users", 500);
  }
}

export async function getUserDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorEmail = req.user?.email;
    const userEmail = req.query.email as string;

    if (!userEmail) {
      throw new AppError("User email is required", 400);
    }

    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    const user = await User.findOne({ email: userEmail }).select("-password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if this user is assigned to the doctor
    if (!doctor.patients.some((patientId) => patientId.equals(user._id))) {
      throw new AppError("User is not assigned to this doctor", 403);
    }

    res.status(200).json({ user });
    return;
  } catch (error) {
    console.error(error);
    throw new AppError("Error fetching user details", 500);
  }
}

export async function uploadUserFile(req: Request, res: Response) {
  try {
    const userEmail = req.body.userEmail;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const userId = user._id;

    if (!req.files || !req.files.file) {
      throw new AppError("No file uploaded", 400);
    }

    const file = req.files.file as UploadedFile;
    const uploadDir = path.join(__dirname, "../../../userUploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userId}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await file.mv(filePath);

    user.medicalreports.push(fileName);
    await user.save();

    res.status(200).json({ message: "File uploaded successfully", fileName });
  } catch (error) {
    console.error(error);
    throw new AppError("Error uploading file", 500);
  }
}
