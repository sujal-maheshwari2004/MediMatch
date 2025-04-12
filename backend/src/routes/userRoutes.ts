import Router from "express";
import {
  getUserDetails,
  updateAssignedDoctor,
} from "../controllers/userController";
import { authAsUser, authenicateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenicateToken);
router.use(authAsUser);

router.get("/", getUserDetails);
router.post("/updateDoctor", updateAssignedDoctor);

export default router;
