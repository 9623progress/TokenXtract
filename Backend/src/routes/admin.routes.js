import express from "express";
import {
  acceptForm,
  approveContract,
  approveContractStage,
  assignContract,
  createContract,
  createDepartment,
  createScheme,
  createToken,
  disburseFundsBulk,
  getAcceptedApplicantsWallet,
  getAcceptedForm,
  getAllApplicationByScheme,
  getAllschemeByDepartment,
  getContractByDepartment,
  getDepartment,
  getMyApprovedContracts,
  getMyCreatedContract,
  getMyPendingContracts,
  getPendingContracts,
  getRejectedForm,
  getScheme,
  rejectContract,
  RejectForm,
  resubmitContract,
  updateScheme,
  viewContractApplication,
} from "../Controllers/admin.controller.js";
import upload from "../middlewares/multer.js";
import { verifyJWT, authorizeRoles } from "../middlewares/Authentication.js";

const router = express.Router();

router.post(
  "/create-scheme",
  verifyJWT,
  authorizeRoles("cg", "state"),
  createScheme
);
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

router.post("/fund-transfer",
  disburseFundsBulk
);

// getAcceptedApplicantsWallet

router.get(
  "/getAcceptedApplicantsWallet/:schemeID",
  // verifyJWT,
  // authorizeRoles("cg"),
  getAcceptedApplicantsWallet
);

router.get(
  "/rejected-form/:id",
  verifyJWT,
  authorizeRoles("cg"),
  getRejectedForm
);
router.post(
  "/create-contract/:user",
  verifyJWT,
  authorizeRoles("cg", "state"),
  createContract
);
router.get(
  "/get-contract-by-department/:departmentID",
  verifyJWT,
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

router.get(
  "/getMyContracts/:userId",
  // verifyJWT,
  // authorizeRoles("cg", "state"),
  getMyCreatedContract
);

router.get("/getPendingContract", getPendingContracts);
router.get("/getMyApprovedContract/:userId", getMyApprovedContracts);
router.get("/getMyPendingContract", getMyPendingContracts);
router.post("/approvedContract", approveContract);
router.post("/approveStage", approveContractStage);


router.post("/rejectContract", rejectContract); // Central Gov
router.post("/resubmitContract", resubmitContract); // State Gov


export default router;
