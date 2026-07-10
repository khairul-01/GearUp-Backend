import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalOrderService } from "./rental.service";
import httpStatus from "http-status";

const createRentalOrder = catchAsync(async (req, res, next) => {
    const customerId = req.user?.id;
    const rentalData = req.body;

    const rentalOrder = await rentalOrderService.createRentalOrder(rentalData, customerId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental order created successfully",
        data: { rentalOrder }
    })
});

export const rentalOrderController = {
    createRentalOrder
};