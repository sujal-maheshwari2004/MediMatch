import mongoose, { Schema } from "mongoose";

const AdminSchema: Schema = new Schema({
  adminId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
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
  },
  approvedDoctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
    },
  ],
  approvedPatients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
