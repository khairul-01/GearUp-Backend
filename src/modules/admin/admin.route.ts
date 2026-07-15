import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { adminController } from "./admin.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createCategorySchema, getQuerySchema, updateUserStatusSchema } from "./admin.validate.js";

const router = Router();

router.post("/categories", auth(UserRole.ADMIN), validateRequest(createCategorySchema), adminController.createCategory);

router.get("/users", auth(UserRole.ADMIN), validateRequest(getQuerySchema), adminController.getAllUsers);

router.patch("/users/:id", auth(UserRole.ADMIN), validateRequest(updateUserStatusSchema), adminController.updateUserStatus);

router.get("/gear", auth(UserRole.ADMIN), validateRequest(getQuerySchema), adminController.getAllGear);

router.get("/rentals", auth(UserRole.ADMIN), validateRequest(getQuerySchema), adminController.getAllRentalOrders);

export const adminRoutes = router;