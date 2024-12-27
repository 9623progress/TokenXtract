import express from "express";
import {
  isAuthenticatedFunc,
  login,
  logout,
  register,
} from "../Controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/isAuthenticated", isAuthenticatedFunc);
export default router;
