import { Request, Response } from "express";
import mongoose from "mongoose";

import User from "../models/users";
import Doctor from "../models/doctors";
import Admin from "../models/admins";
import AppError from "../utils/AppError";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export const getNewRegistrations = async (req: Request, res: Response) => {
  try {
    const unverifiedUsers = await User.find({ isVerified: false }).select(
      "-password -_id -__v"
    );
    const unverifiedDoctors = await Doctor.find({ isVerified: false }).select(
      "-password -_id -__v"
    );

    res.status(200).json({
      success: true,
      data: {
        users: unverifiedUsers,
        doctors: unverifiedDoctors,
      },
    });
    return;
  } catch (error) {
    console.error("Error fetching new registrations:", error);
    throw new AppError("Error fetching new registrations", 500);
  }
};

export async function updateVerification(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const adminEmail = req.user?.email;

    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin || admin === null) {
      throw new AppError("Admin not found", 404);
    }

    const { email, role } = req.body;

    if (!email || !role) {
      throw new AppError("Email and role are required", 400);
    }

    let updatedRecord;

    if (role === "user") {
      updatedRecord = await User.findOneAndUpdate(
        { email },
        { isVerified: true }
      ).select("-password -__v");

      if (!updatedRecord) {
        throw new AppError("User not found", 404);
      }

      (admin.approvedPatients as mongoose.Types.ObjectId[]).push(
        updatedRecord._id
      );
    } else if (role === "doctor") {
      updatedRecord = await Doctor.findOneAndUpdate(
        { email },
        { isVerified: true }
      ).select("-password -__v");

      if (!updatedRecord) {
        throw new AppError("User not found", 404);
      }

      (admin.approvedDoctors as mongoose.Types.ObjectId[]).push(
        updatedRecord._id
      );
    } else {
      throw new AppError("Invalid role specified", 400);
    }

    await admin.save();

    res.status(200).json({
      success: true,
      user: updatedRecord.email,
    });
    return;
  } catch (error) {
    console.error("Error updating verification:", error);
    throw new AppError("Error updating verification", 500);
  }
};
