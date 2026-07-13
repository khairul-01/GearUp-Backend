import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router = Router();

router.post("/categories", auth(UserRole.ADMIN), adminController.createCategory);

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

router.patch("/users/:id", auth(UserRole.ADMIN), adminController.updateUserStatus);

router.get("/gear", auth(UserRole.ADMIN), adminController.getAllGear);

router.get("/rentals", auth(UserRole.ADMIN), adminController.getAllRentalOrders);

export const adminRoutes = router;