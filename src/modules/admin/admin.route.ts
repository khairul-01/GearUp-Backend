import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router = Router();

router.post("/categories", auth(UserRole.ADMIN), adminController.createCategory);

export const adminRoutes = router;