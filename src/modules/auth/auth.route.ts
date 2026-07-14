import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/me", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER), authController.getMyself);

export const authRoutes = router;