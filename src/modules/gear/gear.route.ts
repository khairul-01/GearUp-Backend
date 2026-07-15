import { Router } from "express";
import { gearController } from "./gear.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { getGearByIdSchema, getGearSchema } from "./gear.validate.js";

const router = Router();

router.get("/", validateRequest(getGearSchema), gearController.getAllGear);

router.get("/categories", gearController.getAllCategories);

router.get("/:id", validateRequest(getGearByIdSchema), gearController.getGearById);


export const gearRoutes = router;