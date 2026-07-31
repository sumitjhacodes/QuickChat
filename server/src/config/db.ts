import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is defined missing");

    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully✅");
  } catch (error) {
    console.error("Mongoose connection error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
};
