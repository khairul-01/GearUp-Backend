import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/me", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER), authController.getMyself);

export const authRoutes = router;