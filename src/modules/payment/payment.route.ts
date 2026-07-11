import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth(UserRole.CUSTOMER), paymentController.createPaymentIntent);

export const paymentRoutes = router;