import z from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Category name is required" })
      .max(100, { message: "Category name must be less than 100 characters" }),
    description: z
      .string()
      .max(200, {
        message: "Category description must be less than 200 characters",
      })
      .optional(),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    params: z.object({
      userId: z.string().uuid({ message: "Invalid user ID" }),
    }),

    status: z.enum(["ACTIVE", "INACTIVE"], { message: "Invalid status value" })
  })
});

export const getQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    minPrice: z.string()
    .optional(),
    maxPrice: z.string()
    .optional(),
    available: z.string().optional()
  })
});
