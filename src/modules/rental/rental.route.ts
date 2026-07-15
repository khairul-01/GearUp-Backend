import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { rentalOrderController } from "./rental.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createRentalOrderSchema, getRentalOrderByIdSchema } from "./rental.validate.js";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), validateRequest(createRentalOrderSchema), rentalOrderController.createRentalOrder);

router.get("/", auth(UserRole.CUSTOMER), rentalOrderController.getRentalOrders);

router.get("/:id", auth(UserRole.CUSTOMER), validateRequest(getRentalOrderByIdSchema), rentalOrderController.getRentalOrderById);

export const rentalOrderRoutes = router;