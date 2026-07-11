import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/create", auth(UserRole.CUSTOMER), paymentController.createCheckoutSession);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(UserRole.CUSTOMER), paymentController.getMyPayments);

router.get("/:paymentId", auth(UserRole.CUSTOMER), paymentController.getPaymentById);

export const paymentRoutes = router;