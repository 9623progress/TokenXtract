import mongoose from "mongoose";

const dep = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

export const department = mongoose.model("department", dep);
