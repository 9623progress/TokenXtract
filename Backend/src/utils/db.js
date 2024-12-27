import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected Sucessfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connect;
