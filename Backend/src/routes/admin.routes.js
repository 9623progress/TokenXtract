import express from "express";
import {
  acceptForm,
  createContract,
  createDepartment,
  createScheme,
  getAcceptedForm,
  getAllApplicationByScheme,
  getAllschemeByDepartment,
  getContractByDepartment,
  getDepartment,
  getRejectedForm,
  getScheme,
  RejectForm,
  updateScheme,
} from "../Controllers/admin.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/create-scheme", createScheme);
router.get("/get-scheme/:departmentID", getAllschemeByDepartment);
router.post("/create-department", upload.single("image"), createDepartment);
router.get("/get-applications/:schemeID", getAllApplicationByScheme);
router.get("/get-departments", getDepartment);
router.get("/get-single-scheme/:id", getScheme);
router.put("/update-scheme/:id", updateScheme);
router.patch("/accept-form/:id", acceptForm);
router.patch("/reject-form/:id", RejectForm);
router.get("/accepted-form/:id", getAcceptedForm);
router.get("/rejected-form/:id", getRejectedForm);
router.post("/create-contract", createContract);
router.get(
  "/get-contract-by-department/:departmentID",
  getContractByDepartment
);
export default router;
