import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post("/create", auth(UserRole.CUSTOMER), paymentController.createCheckoutSession);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(UserRole.CUSTOMER), paymentController.getMyPayments);

router.get("/:paymentId", auth(UserRole.CUSTOMER), paymentController.getPaymentById);

export const paymentRoutes = router;