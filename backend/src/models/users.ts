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
  organRequired: {
    type: String,
    enum: ["kidney", "liver", "heart", "lung"],
    required: true,
    default: null,
  },
  medicalDetails: {
    bloodGroup: {
      type: String,
      required: true,
    },
    bloodPressure: {
      type: String,
      required: true,
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
    required: true,
  },
  severityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
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
