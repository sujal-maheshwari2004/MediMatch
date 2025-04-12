import mongoose from "mongoose";

async function connectDB(URI: string): Promise<string> {
  try {
    await mongoose.connect(URI);
    return Promise.resolve("Connected to DB");
  } catch (error) {
    return Promise.reject(error);
  }
}

export default connectDB;
