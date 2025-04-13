import Router from "express";
import {
  getUserDetails,
  updateAssignedDoctor,
  getAssignedDoctor,
} from "../controllers/userController";
import { authAsUser, authenicateToken } from "../middlewares/authMiddleware";

const router = Router();

router.use(authenicateToken);
router.use(authAsUser);

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Get current user details
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Not authenticated or not a user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getUserDetails);

router.get("/doctor", getAssignedDoctor);

/**
 * @swagger
 * /api/v1/user/updateDoctor:
 *   post:
 *     summary: Update user's assigned doctor
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorEmail
 *             properties:
 *               doctorEmail:
 *                 type: string
 *                 format: email
 *                 example: "doctor@example.com"
 *     responses:
 *       200:
 *         description: Doctor assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Doctor assigned successfully"
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Dr. Jane Smith"
 *                     email:
 *                       type: string
 *                       example: "doctor@example.com"
 *                     phone:
 *                       type: string
 *                       example: "1234567890"
 *       400:
 *         description: Doctor not selected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Not authenticated or not a user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/updateDoctor", updateAssignedDoctor);

export default router;
