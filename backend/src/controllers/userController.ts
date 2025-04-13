import { Request, Response } from "express";
import User from "../models/users";
import Doctor from "../models/doctors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import AppError from "../utils/AppError";
import path from "path";
import fs from "fs";

export async function getUserDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const userEmail = req.user?.email;
    const user = await User.findOne({ email: userEmail }).select(
      "-password -_id"
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({ user });
  } catch (error) {
    throw new AppError("Error in fetching user details", 500);
  }
}

export async function updateAssignedDoctor(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userEmail = req.user?.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const selectedDoctor = req.body.doctorEmail;
    if (!selectedDoctor) {
      throw new AppError("Doctor not selected", 400);
    }

    const doctor = await Doctor.findOne({ email: selectedDoctor });
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    user.designatedDoctor = doctor._id;
    await user.save();

    doctor.patients.push(user._id);
    await doctor.save();

    res.status(200).json({
      message: "Doctor assigned successfully",
      doctor: {
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
      },
    });
    return;
  } catch (error) {
    throw new AppError("Error in assigning doctor", 500);
  }
}

export async function getUserDocuments(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userEmail = req.user?.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const uploadsDir = path.join(__dirname, "../../userUploads");
    const userFiles = fs
      .readdirSync(uploadsDir)
      .filter((file) => file.startsWith(user._id.toString()));

    if (userFiles.length === 0) {
      res.status(200).json({
        message: "User documents fetched successfully",
        documents: [],
      });
      return;
    }

    const fileUrls = userFiles.map((file) => path.join(uploadsDir, file));

    res.status(200).json({
      message: "User documents fetched successfully",
      documents: fileUrls,
    });
  } catch (error) {
    throw new AppError("Error in fetching user documents", 500);
  }
}

export async function getAssignedDoctor(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userEmail = req.user?.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.designatedDoctor) {
      res.status(200).json({
        message: "No doctor assigned",
        doctor: null,
      });
      return;
    }

    const doctor = await Doctor.findById(user.designatedDoctor);
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    res.status(200).json({
      doctor: {
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
      },
    });
  } catch (error) {
    throw new AppError("Error in fetching assigned doctor", 500);
  }
}
