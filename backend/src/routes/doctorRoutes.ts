import Router from "express";
import {
  getUsers,
  getDoctorDetails,
  uploadUserFile,
} from "../controllers/doctorController";
import { authAsDoctor, authenicateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenicateToken);
router.use(authAsDoctor);

router.get("/", getDoctorDetails);
router.get("/users", getUsers);
router.post("/upload", uploadUserFile);

export default router;
