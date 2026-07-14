import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { gearService } from "./gear.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import httpStatus from "http-status";

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await gearService.getAllGear(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear items retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const gearId = req.params.id;

    const gearItem = await gearService.getGearById(gearId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear item retrieved successfully",
      data: gearItem,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await gearService.getAllCategories();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

export const gearController = {
  getAllGear,
  getGearById,
  getAllCategories,
};
