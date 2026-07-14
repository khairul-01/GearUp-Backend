import { Router } from "express";
import { gearController } from "./gear.controller.js";

const router = Router();

router.get("/", gearController.getAllGear);

router.get("/categories", gearController.getAllCategories);

router.get("/:id", gearController.getGearById);


export const gearRoutes = router;