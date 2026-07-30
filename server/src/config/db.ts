import mongoose from "mongoose";

export const connectDB: () => Promise<void> = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB Connected Successfully✅`);
    } catch (error:any) {
        console.log(`Mongoose Connection error: ${error.message}`);
        process.exit(1);
    }
};