import { Request, Response } from "express";
import User from "../models/users";
import Doctor from "../models/doctors";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import AppError from "../utils/AppError";
import path from "path";
import fs from "fs";
import { UploadedFile } from "express-fileupload";
import { calculateSeverityScore, updateRankings } from "../utils/calcSeverity";

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
    const userEmail = req.query.email as string;

    if (!userEmail) {
      throw new AppError("User email is required", 400);
    }

    const user = await User.findOne({ email: userEmail }).select("-password");
    if (!user) {
      throw new AppError("User not found", 404);
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

export async function updateMedicalDetails(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { email, organRequired, severityScore, medicalDetails } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    // Find the patient by email
    const patient = await User.findOne({ email: email });

    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    // Update patient details
    patient.organRequired = organRequired;
    patient.medicalDetails = {
      ...patient.medicalDetails,
      ...medicalDetails,
    };

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Medical details updated successfully",
    });
    return;
  } catch (error) {
    console.error("Error updating medical details:", error);
    throw new AppError("Error updating medical details", 500);
  }
}

export async function getAIEval(req: AuthenticatedRequest, res: Response) {
  try {
    const { email } = req.query;

    if (!email) {
      throw new AppError("User email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user || !user.medicalDetails) {
      throw new AppError("User not found", 404);
    }

    const requestData = {
      email: email,
      organRequired: user.organRequired || "heart",
    };

    // Call the Flask API
    const response = await fetch("http://localhost:3001/eval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const aiResult = await response.json();

    if (!response.ok) {
      throw new AppError("AI evaluation failed", 500);
    }

    user.medicalDetails.bloodPressure = aiResult.bp;
    user.medicalDetails.heartAttack =
      aiResult.heart_attack === "Yes" ? true : false;
    user.medicalDetails.heartDefectByBirth =
      aiResult.heart_defect === "Yes" ? true : false;
    user.medicalDetails.heartValve =
      aiResult.heart_valve === "Yes" ? true : false;
    user.medicalDetails.cardiomyopathy =
      aiResult.cardiomyopathy === "Yes" ? true : false;

    // save the updated user to the database
    await user.save();

    // getting new medical details
    const newSeverityScore = await calculateSeverityScore(user.email);
    user.severityScore = newSeverityScore;

    await user.save();

    // Update the rankings
    await updateRankings();

    res.status(200).json({ aiResult });
  } catch (error) {
    console.error("Error in AI evaluation:", error);
    throw new AppError("Unknown error in AI evaluation", 500);
  }
}
