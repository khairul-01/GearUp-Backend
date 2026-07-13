import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import jwt from "jsonwebtoken";


export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("Error: ", err);

    let statusCode = err.statusCode || 500;
    let errorMessage = err.message || "Internal Server Error";
    let errorName = err.name || "Internal Server Error";

    // Handle expected errors 
    if(err instanceof Prisma.PrismaClientValidationError) {
        ((statusCode = httpStatus.BAD_REQUEST),
        (errorMessage = "You have provided invalid data. Please check your request and try again."));
    } else if(err instanceof Prisma.PrismaClientKnownRequestError) {
        if(err.code === "P2002") {
            statusCode = httpStatus.CONFLICT;
            errorMessage = "Duplicate field value entered. Please use another value.";
        }else if(err.code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Foreign key constraint failed. Please check your request and try again.";
        }  else if(err.code === "P2025") {
            statusCode = httpStatus.NOT_FOUND;
            errorMessage = "An operation failed because it depends on one or more records that were required but not found. Please check your request and try again.";
        } 
    } else if(err instanceof Prisma.PrismaClientInitializationError) {
        if(err.errorCode === "P1001") {
            statusCode = httpStatus.BAD_REQUEST;
            errorMessage = "Database connection failed. Please check your database connection and try again.";
        } else if(err.errorCode === "P1000") {
            statusCode = httpStatus.UNAUTHORIZED;
            errorMessage = "Database authentication failed. Please check your database credentials and try again.";
        } 
    } else if(err instanceof Prisma.PrismaClientUnknownRequestError) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = "Error occurred during query execution. Please check your request and try again.";
    } else if(err instanceof jwt.JsonWebTokenError) {
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Invalid token. Please log in again.";
    } else if(err instanceof jwt.TokenExpiredError) {
        statusCode = httpStatus.UNAUTHORIZED;
        errorMessage = "Your token session has expired. Please log in again.";
    }

    res.status(statusCode).json({
        success: false,
        statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
        name: errorName,
        message: errorMessage,
        errorDetails: config.node_env === "development" ? err.stack : null
    })
}