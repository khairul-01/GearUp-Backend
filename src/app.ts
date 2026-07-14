import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/index.js";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { notFoundRoute } from "./middlewares/notFound.js";
import { authRoutes } from "./modules/auth/auth.route.js";
import { adminRoutes } from "./modules/admin/admin.route.js";
import { providerRoutes } from "./modules/provider/provider.route.js";
import { rentalOrderRoutes } from "./modules/rental/rental.route.js";
import { paymentRoutes } from "./modules/payment/payment.route.js";
import { reviewRoutes } from "./modules/review/review.route.js";
import { gearRoutes } from "./modules/gear/gear.route.js";

const app : Application = express();

// Middleware
app.use(cors({
    origin: config.app_url,
    credentials: true,
}));

app.use("/api/payments/confirm", express.raw({ type: "application/json" })); // For Stripe webhook

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", async (req: Request, res: Response) => {
    res.send("Welcome to GearUp Backend API");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/rentals", rentalOrderRoutes);
app.use("/api/payments", paymentRoutes); // For payment related routes
app.use("/api/reviews", reviewRoutes); // For review related routes
app.use("/api/gear", gearRoutes); // For gear related routes

app.use(notFoundRoute);

app.use(globalErrorHandler);

export default app;