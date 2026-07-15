import z from "zod";

export const createPaymentSchema = z.object({
    body: z.object({
        rentalOrderId: z.string().uuid({ message: "Invalid rental order ID" }),
    })
});

export const getPaymentByIdSchema = z.object({
    params: z.object({
        paymentId: z.string().uuid({ message: "Invalid payment ID" })
    })
});