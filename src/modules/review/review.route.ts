import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), reviewController.createReview);

export const reviewRoutes = router;