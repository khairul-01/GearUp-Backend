import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { providerController } from "./provider.controller";

const router = Router();

router.post("/gear", auth(UserRole.PROVIDER), providerController.createGearItem);
router.put("/gear/:gearId", auth(UserRole.PROVIDER), providerController.updateGearItem);
router.delete("/gear/:gearId", auth(UserRole.PROVIDER), providerController.deleteGearItem);

export const providerRoutes = router;