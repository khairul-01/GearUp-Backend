import z from "zod";

export const getGearSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        category: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        search: z.string().optional(),
        available: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional()
    })
});

export const getGearByIdSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: "Invalid gear ID" })
    })
});
