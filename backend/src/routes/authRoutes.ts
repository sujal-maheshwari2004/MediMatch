import { Router } from "express";
import {
  signupService,
  loginService,
  logoutService,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signupService);
router.post("/login", loginService);
router.post("/logout", logoutService);

export default router;
