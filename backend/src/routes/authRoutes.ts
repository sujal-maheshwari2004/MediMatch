import { Router } from "express";
import { signupService, loginService } from "../controllers/authController";

const router = Router();

router.post("/signup", signupService);
router.post("/login", loginService);

export default router;
