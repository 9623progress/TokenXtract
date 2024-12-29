import mongoose from "mongoose";

const dep = new mongoose.Schema({
  departmentName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

export const department = mongoose.model("department", dep);
