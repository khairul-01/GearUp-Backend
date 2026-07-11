import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";

const createPaymentIntent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;
    console.log(payload)
    const paymentIntent = await paymentService.createPaymentIntent(customerId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment intent created successfully",
        data: { paymentIntent }
    });
});

const createCheckoutSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const paymentIntent = await paymentService.createPaymentSession(req.user?.id as string, req.body.rentalOrderId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Checkout session created successfully",
        data: { paymentIntent }
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer; // This event sent by Stripe is a raw buffer, not JSON. So we need to handle it as such.
    const signature = req.headers['stripe-signature'] as string;

    await paymentService.confirmPayment(event, signature);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Webhook event processed successfully. Payment status updated accordingly.",
        data: null
    });
});

export const paymentController = {
    createPaymentIntent,
    createCheckoutSession,
    confirmPayment
};