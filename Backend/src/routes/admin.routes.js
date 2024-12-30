import express from "express";
import {
  createDepartment,
  createScheme,
  getAllApplicationByScheme,
  getAllschemeByDepartment,
} from "../Controllers/admin.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create-scheme", createScheme);
router.get("/get-scheme/:departmentID", getAllschemeByDepartment);
router.post("/create-department", upload.single("image"), createDepartment);
router.get("/get-applications/:schemeID", getAllApplicationByScheme);

export default router;
