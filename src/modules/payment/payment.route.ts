import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { paymentController } from "./payment.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createPaymentSchema, getPaymentByIdSchema } from "./payment.validate.js";

const router = Router();

router.post("/create", auth(UserRole.CUSTOMER), validateRequest(createPaymentSchema), paymentController.createCheckoutSession);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(UserRole.CUSTOMER), paymentController.getMyPayments);

router.get("/:paymentId", auth(UserRole.CUSTOMER), validateRequest(getPaymentByIdSchema), paymentController.getPaymentById);

export const paymentRoutes = router;