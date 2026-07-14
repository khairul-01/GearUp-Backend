import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { reviewService } from "./review.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;

    const review = await reviewService.createReview(customerId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Review created successfully",
        data: {review}
    });
});

export const reviewController = {
    createReview,
};