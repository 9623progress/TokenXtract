import express from "express";
import {
  applyForContract,
  getBanks,
  getContractByState,
  getMoney,
  getMyAppliedContract,
  getMyAppliedSchemes,
  getSchemeForm,
  getTokenStats,
  getWalleteId,
  login,
  logout,
  reapply,
  reapplyForScheme,
  register,
  submitForm,
  updateMoney,
  uploadStageProof,
  userProfile,
} from "../Controllers/user.controller.js";
// import { isAuthenticated } from "../middlewares/Authentication.js";
// import { UploadStream } from "cloudinary";
import upload from "../middlewares/multer.js";
import {
  authorizeRoles,
  isAuthenticated,
  verifyJWT,
} from "../middlewares/Authentication.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/isAuthenticated", isAuthenticated);
router.get("/getForm/:schemeID", getSchemeForm);
router.post("/submit", verifyJWT, upload.any(), submitForm);
router.get("/profile/:id", verifyJWT, userProfile);
router.get("/getMyAppliedSchemes", verifyJWT, getMyAppliedSchemes);
router.put("/reapply/:schemeId", verifyJWT, reapplyForScheme);
router.put("/reapply/:userId", verifyJWT, reapply);
router.get("/getTokenStats ", getTokenStats);

router.post(
  "/fill-tender/:userId",
  verifyJWT,
  authorizeRoles("contractor"),
  upload.single("file"),
  applyForContract
);

router.get("/getContractByState/:state", getContractByState);
router.get("/getWalleteId/:id", getWalleteId);
router.get("/myAppliedContracts/:id", getMyAppliedContract);

router.post("/uploadStageProof", upload.single("file"), uploadStageProof);
router.get("/getBanks", getBanks);
router.post("/updateMoney/:id", updateMoney);
router.get("/getMoney/:id", getMoney);
export default router;
