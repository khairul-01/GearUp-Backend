import z from "zod";

export const updateOrderSchema = z.object({
    params: z.object({
        rentalOrderId: z.string().uuid({ message: "Invalid rental order ID" })
    }),
    body: z.object({
        status: z.enum(
            ["PLACED", "CONFIRMED", "PAID", "PICKED_UP", "RETURNED", "CANCELLED"], 
            { message: "Invalid status value" })
    })
})

export const createGearItemSchema = z.object({
    body: z.object({
        categoryId: z.string(),
        name: z.string(),
        description: z.string(),
        brand: z.string(),
        condition: z.enum(["NEW", "USED"]),
        rentalPricePerDay: z.number().positive({ message: "Rental price per day must be a positive number" }),
        quantity: z.number().int().positive({ message: "Quantity must be a positive integer" }),
        imageUrl: z
        .string()
        .url({ message: "Invalid image URL" })
        .optional()
    })
});

export const updateGearItemSchema = z.object({
    params: z.object({
        gearId: z.string().uuid({ message: "Invalid gear ID" })
    }),
    body: z.object({
        categoryId: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        brand: z.string().optional(),
        condition: z.enum(["NEW", "USED"]).optional(),
        rentalPricePerDay: z.number()
        .positive({ message: "Rental price per day must be a positive number" })
        .optional(),
        quantity: z
        .number().int()
        .positive({ message: "Quantity must be a positive integer" })
        .optional(),
        imageUrl: z
            .string()
            .url({ message: "Invalid image URL" })
            .optional()
    })
});

export const deleteGearItemSchema = z.object({
    params: z.object({
        gearId: z.string().uuid({ message: "Invalid gear ID" })
    })
});

export const getProvidersOrdersSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
    })
});
