import z from "zod";

export const createReviewSchema = z.object({
    body: z.object({
        rentalOrderId: z.string().uuid({ message: "Invalid rental order ID" }),
        rating: z.number()
        .min(1, { message: "Rating must be at least 1" })
        .max(5, { message: "Rating must be at most 5" }),
        comment: z.string().max(200, { message: "Comment must be at most 200 characters" }).optional()
    })
});