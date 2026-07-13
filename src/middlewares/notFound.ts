import { Request, Response } from "express";
import httpStatus from "http-status";

export const notFoundRoute = (req: Request, res: Response) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: "API route not found",
        errorDetails: `The requested route ${req.originalUrl} does not exist on this server.`,
        date: new Date()
    });
};