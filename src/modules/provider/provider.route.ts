import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { providerController } from "./provider.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createGearItemSchema, deleteGearItemSchema, getProvidersOrdersSchema, updateGearItemSchema, updateOrderSchema } from "./provider.validate.js";

const router = Router();

router.post("/gear", auth(UserRole.PROVIDER), validateRequest(createGearItemSchema), providerController.createGearItem);
router.put("/gear/:gearId", auth(UserRole.PROVIDER), validateRequest(updateGearItemSchema), providerController.updateGearItem);
router.delete("/gear/:gearId", auth(UserRole.PROVIDER), validateRequest(deleteGearItemSchema), providerController.deleteGearItem);
router.get("/orders", auth(UserRole.PROVIDER), validateRequest(getProvidersOrdersSchema), providerController.getProvidersOrders);
router.patch("/orders/:rentalOrderId", auth(UserRole.PROVIDER), validateRequest(updateOrderSchema), providerController.updateRentalOrderStatus);

export const providerRoutes = router;