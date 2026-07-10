import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { rentalOrderController } from "./rental.controller";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), rentalOrderController.createRentalOrder);

export const rentalOrderRoutes = router;