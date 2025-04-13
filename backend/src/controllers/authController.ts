import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import User from "../models/users";
import Doctor from "../models/doctors";
import Admin from "../models/admins";
import AppError from "../utils/AppError";
import { signJwt } from "../utils/jwtUtils";

export async function signupService(req: Request, res: Response) {
  try {
    const { name, email, password, phone, role } = req.body;

    // check if user already exists
    if (await checkUserExists(email, role)) {
      throw new AppError("User already exists", 400);
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // create a new user
    let newUser: any;

    if (role === "user") {
      const { age, gender } = req.body;
      // Create a new user
      newUser = new User({
        medicalRecordId: uuidv4(),
        name,
        age,
        gender,
        email,
        password: hashedPassword,
        phone,
      });
    } else if (role === "doctor") {
      const { department } = req.body;
      // Create a new doctor
      newUser = new Doctor({
        doctorId: uuidv4(),
        name,
        email,
        password: hashedPassword,
        phone,
        department,
      });
    } else if (role === "admin") {
      // Create a new admin
      newUser = new Admin({
        adminId: uuidv4(),
        name,
        email,
        password: hashedPassword,
        phone,
      });
    } else {
      throw new AppError("Invalid role", 400);
    }

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: { email: newUser.email, role: role },
    });
    return;
  } catch (error) {
    console.error(error);
    throw new AppError("Error creating user", 500);
  }
}

export async function loginService(req: Request, res: Response) {
  const { email, password, role } = req.body;
  try {
    // check if user exists
    let existingUser: { email: string; password: string; name: string } | null =
      null;

    if (role === "user") {
      existingUser = await User.findOne({ email });
    } else if (role === "doctor") {
      existingUser = await Doctor.findOne({ email });
    } else if (role === "admin") {
      existingUser = await Admin.findOne({ email });
    } else {
      throw new AppError("Invalid role", 400);
    }

    if (!existingUser || existingUser == null) {
      throw new AppError("User not found", 401);
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      throw new AppError("Invalid password", 401);
    }

    // generate JWT token
    const token = signJwt({
      email: existingUser.email,
      name: existingUser.name,
      role,
    });

    res.cookie("token", token);

    res.status(200).json({
      message: "Login successful",
      user: { email: existingUser.email, role: role },
    });
    return;
  } catch (error) {
    console.error(error);
    throw new AppError("Invalid credentials", 401);
  }
}

export async function logoutService(req: Request, res: Response) {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logout successful",
    });
    return;
  } catch (error) {
    console.error(error);
    throw new AppError("Error logging out", 500);
  }
}

async function checkUserExists(email: string, role: string): Promise<boolean> {
  let existingUser: { email: string; password: string } | null = null;

  if (role === "doctor") {
    existingUser = await Doctor.findOne({ email });
  } else if (role === "admin") {
    existingUser = await Admin.findOne({ email });
  } else if (role === "user") {
    existingUser = await User.findOne({ email });
  } else {
    throw new AppError("Invalid role", 400);
  }

  if (existingUser) {
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}
