import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createReviewSchema } from "./review.validate.js";

const router = Router();

router.post("/", auth(UserRole.CUSTOMER), validateRequest(createReviewSchema), reviewController.createReview);

export const reviewRoutes = router;