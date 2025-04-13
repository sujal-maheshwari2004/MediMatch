import { Request, Response } from "express";
import mongoose from "mongoose";

import User from "../models/users";
import Doctor from "../models/doctors";
import Admin from "../models/admins";
import AppError from "../utils/AppError";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export async function getAdminDetails(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const adminEmail = req.user?.email;

    const admin = await Admin.findOne({ email: adminEmail }).select(
      "-password -_id -__v"
    );

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
    return;
  } catch (error) {
    console.error("Error fetching admin details:", error);
    throw new AppError("Error fetching admin details", 500);
  }
}

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
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    // Find all verified users
    const users = await User.find({ isVerified: true })
      .select("-password -__v")
      .populate({
        path: "designatedDoctor",
        select: "name email phone department -_id",
      });

    res.status(200).json({
      success: true,
      users: users,
    });
    return;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new AppError("Error fetching all users", 500);
  }
}

export async function getUserDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const userEmail = req.query.email as string;

    if (!userEmail) {
      throw new AppError("User email is required", 400);
    }

    const user = await User.findOne({ email: userEmail })
      .select("-password")
      .populate({
        path: "designatedDoctor",
        select: "name email phone department -_id",
      });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user: user,
    });
    return;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new AppError("Error fetching user details", 500);
  }
}
