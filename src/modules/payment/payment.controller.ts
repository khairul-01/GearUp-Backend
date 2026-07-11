import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import httpStatus from "http-status";

const createPaymentIntent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;
    console.log(payload)
    const paymentIntent = await paymentService.createPaymentIntent(customerId as string, payload);

    res.status(200).json({
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment intent created successfully",
        data: { paymentIntent }
    });
});

export const paymentController = {
    createPaymentIntent
};