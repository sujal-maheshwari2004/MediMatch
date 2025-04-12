import { Request, Response } from "express";
import User from "../models/users";
import Doctor from "../models/doctors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import AppError from "../utils/AppError";

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
