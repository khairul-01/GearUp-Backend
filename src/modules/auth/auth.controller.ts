import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await authService.registerUser(payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: {user}
    })
});

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await authService.loginUser(payload);

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: false, // true in production,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: result
    })
});

const getMyself = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const user = await authService.getMyself(req.user?.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User fetched successfully",
        data: {user}
    });
})

export const authController = {
    registerUser,
    loginUser,
    getMyself
}