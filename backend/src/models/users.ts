import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  medicalRecordId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 120,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  organRequired: {
    type: String,
    enum: ["kidney", "liver", "Heart", "lung", "NA"],
    required: true,
    default: "NA",
  },
  medicalDetails: {
    bloodGroup: {
      type: String,
      required: true,
      default: "NA",
    },
    bloodPressure: {
      type: String,
      required: true,
      default: "NA",
    },
    heartAttack: {
      type: Boolean,
      required: true,
      default: false,
    },
    heartValve: {
      type: Boolean,
      required: true,
      default: false,
    },
    heartDefectByBirth: {
      type: Boolean,
      required: true,
      default: false,
    },
    cardiomyopathy: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  designatedDoctor: {
    type: Schema.Types.ObjectId,
    ref: "doctors",
  },
  severityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  currentRank: {
    type: Number,
    required: true,
    default: 0,
  },
  medicalreports: {
    type: [String],
    default: [],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("users", userSchema);
export default User;
