import express from "express";
import {
  getSchemeForm,
  login,
  logout,
  register,
  submitForm,
  userProfile,
} from "../Controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/Authentication.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/isAuthenticated", isAuthenticated);
router.get("/getForm/:schemeID", getSchemeForm);
router.post("/submit", submitForm);
router.get("/profile/:id", userProfile);

export default router;
