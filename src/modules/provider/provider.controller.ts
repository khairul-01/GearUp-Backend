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

const deleteGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const gearId = req.params.gearId;

    await providerService.deleteGearItem(gearId as string, providerId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item deleted successfully",
        data: null
    });
});

const getProvidersOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const query = req.query;

    const result = await providerService.getProvidersOrders(providerId as string, query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Orders retrieved successfully",
        data: result
    });
});

const updateRentalOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const rentalOrderId = req.params.rentalOrderId;
    const payload = req.body;

    const updatedOrder = await providerService.updateRentalOrderStatus(rentalOrderId as string, providerId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order status updated successfully",
        data: { updatedOrder }
    });
});

export const providerController = {
    createGearItem,
    updateGearItem,
    deleteGearItem,
    getProvidersOrders,
    updateRentalOrderStatus
}
