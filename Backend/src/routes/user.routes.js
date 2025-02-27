import express from "express";
import {
  applyForContract,
  getContractByState,
  getMyAppliedContract,
  getSchemeForm,
  getWalleteId,
  login,
  logout,
  register,
  submitForm,
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
export default router;
