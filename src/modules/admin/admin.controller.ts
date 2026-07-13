import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await adminService.createCategory(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: {category}
    })
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsers(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        meta: result.meta,
        data: result.data
    })
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;
    
    const updatedUser = await adminService.updateUserStatus(userId as string, req.user?.id as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: { updatedUser }
    });
});

const getAllGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllGear(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

const getAllRentalOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllRentalOrders(req.query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental orders retrieved successfully",
        meta: result.meta,
        data: result.data
    });
});

export const adminController = {
    createCategory,
    getAllUsers,
    updateUserStatus,
    getAllGear,
    getAllRentalOrders
}