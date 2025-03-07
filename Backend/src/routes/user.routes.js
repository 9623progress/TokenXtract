import express from "express";
import {
  applyForContract,
  getSchemeForm,
  login,
  logout,
  register,
  submitForm,
  userProfile,
} from "../Controllers/user.controller.js";
// import { isAuthenticated } from "../middlewares/Authentication.js";
// import { UploadStream } from "cloudinary";
import upload from "../middlewares/multer.js";
import { isAuthenticated, verifyJWT } from "../middlewares/Authentication.js";

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
  upload.single("file"),
  applyForContract
);

export default router;
