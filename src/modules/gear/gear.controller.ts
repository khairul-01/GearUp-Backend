import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { gearService } from "./gear.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await gearService.getAllGear(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

export const gearController = {
    getAllGear
};