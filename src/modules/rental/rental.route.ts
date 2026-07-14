import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { rentalOrderController } from "./rental.controller.js";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), rentalOrderController.createRentalOrder);

router.get("/", auth(UserRole.CUSTOMER), rentalOrderController.getRentalOrders);

router.get("/:id", auth(UserRole.CUSTOMER), rentalOrderController.getRentalOrderById);

export const rentalOrderRoutes = router;