import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError, ZodType } from 'zod';

export const validateRequest = (schema: ZodType): RequestHandler => 
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            // if(error instanceof ZodError) {
            //     return res.status(400).json({
            //         success: false,
            //         statusCode: 400,
            //         name: "Validation Error",
            //         message: "Invalid request data",
            //         errorDetails: error.issues.map((issue) => ({
            //             field: issue.path.join('.'),
            //             message: issue.message
            //         }))
            //     })
            // }
            next(error);
        }
    }
