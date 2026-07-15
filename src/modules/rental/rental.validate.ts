import z from "zod";

export const createRentalOrderSchema = z.object({
    body: z.object({
        gearItemId: z.string().uuid({ message: "Invalid gear item ID" }),
        rentalStartDate: z
        .string()  
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid rental start date" }),
        rentalEndDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid rental end date" }),
        quantity: z.number().int()
        .min(1, { message: "Quantity must be at least 1" })
    })
});

export const getRentalOrderByIdSchema = z.object({
    params: z.object({
        rentalOrderId: z.string().uuid({ message: "Invalid rental order ID" })
    })
});