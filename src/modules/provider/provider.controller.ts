import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { providerService } from "./provider.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const providerId = req.user?.id;

    const gear = await providerService.createGearItem(providerId as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Gear item created successfully",
        data: {gear}
    });

});

const updateGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const gearId = req.params.gearId;

    const gear = await providerService.updateGearItem(gearId as string, providerId as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item updated successfully",
        data: {gear}
    });
});

export const providerController = {
    createGearItem,
    updateGearItem
}