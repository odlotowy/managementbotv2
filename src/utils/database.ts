import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.mongo_uri || "";

export const connectDB = async () => {
  try {
    await mongoose.connect(uri, { dbName: "db" });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
