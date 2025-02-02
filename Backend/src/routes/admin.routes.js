import express from "express";
import {
  acceptForm,
  assignContract,
  createContract,
  createDepartment,
  createScheme,
  createToken,
  disburseFundsBulk,
  getAcceptedForm,
  getAllApplicationByScheme,
  getAllschemeByDepartment,
  getContractByDepartment,
  getDepartment,
  getRejectedForm,
  getScheme,
  RejectForm,
  updateScheme,
  viewContractApplication,
} from "../Controllers/admin.controller.js";
import upload from "../middlewares/multer.js";
import { verifyJWT, authorizeRoles } from "../middlewares/Authentication.js";

const router = express.Router();

router.post("/create-scheme", verifyJWT, authorizeRoles("cg"), createScheme);
router.get("/get-scheme/:departmentID", verifyJWT, getAllschemeByDepartment);
router.post(
  "/create-department",
  verifyJWT,
  authorizeRoles("cg"),
  upload.single("image"),
  createDepartment
);
router.get(
  "/get-applications/:schemeID",
  verifyJWT,
  authorizeRoles("cg"),
  getAllApplicationByScheme
);
router.get("/get-departments", getDepartment);
router.get("/get-single-scheme/:id", getScheme);
router.put("/update-scheme/:id", verifyJWT, authorizeRoles("cg"), updateScheme);
router.patch("/accept-form/:id", verifyJWT, authorizeRoles("cg"), acceptForm);
router.patch("/reject-form/:id", verifyJWT, authorizeRoles("cg"), RejectForm);
router.get(
  "/accepted-form/:id",
  verifyJWT,
  authorizeRoles("cg"),
  getAcceptedForm
);
router.get(
  "/rejected-form/:id",
  verifyJWT,
  authorizeRoles("cg"),
  getRejectedForm
);
router.post(
  "/create-contract",
  verifyJWT,
  authorizeRoles("cg"),
  createContract
);
router.get(
  "/get-contract-by-department/:departmentID",
  getContractByDepartment
);
router.get(
  "/get-contracts/:contractId",
  verifyJWT,
  authorizeRoles("cg"),
  viewContractApplication
);
router.post(
  "/assignContract/:contractId",
  verifyJWT,
  authorizeRoles("cg", "audit"),
  assignContract
);
router.post("/create-token", verifyJWT, authorizeRoles("cg"), createToken);
router.post(
  "/fund-transfer",
  verifyJWT,
  authorizeRoles("cg"),
  disburseFundsBulk
);
export default router;
