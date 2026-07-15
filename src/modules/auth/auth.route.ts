import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { authController } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { loginValidationSchema, registerValidationSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validateRequest(registerValidationSchema), authController.registerUser);

router.post("/login", validateRequest(loginValidationSchema), authController.loginUser);

router.get("/me", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.PROVIDER), authController.getMyself);

export const authRoutes = router;