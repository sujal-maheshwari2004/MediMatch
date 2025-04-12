import Router from "express";
import {
  getNewRegistrations,
  updateVerification,
} from "../controllers/adminController";
import { authenicateToken, authAsAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenicateToken);
router.use(authAsAdmin);

router.get("/newRegistrations", getNewRegistrations);
router.post("/updateVerification", updateVerification);

export default router;
