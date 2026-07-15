
import z from "zod";

export const registerValidationSchema = z.object ({
    body: z.object({
        name: z
        .string()
        .min(3, { message: "Name must be at least 3 characters long" }),
        email: z
        // .string()
        .email({ message: "Invalid email address" }),
        password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" }),
        role: z.enum(["CUSTOMER", "PROVIDER"]),
        phone: z
        .string()
        .regex(/^\d{10}$/, { message: "Phone number must be 10 digits long" })
    })
});

export const loginValidationSchema = z.object({
    body: z.object({
        email: z
        .email({ message: "Invalid email address" }),
        password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
    })
});
