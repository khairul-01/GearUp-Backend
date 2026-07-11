import { PaymentMethod, PaymentProvider, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICreatePaymentPayload } from "./payment.interface";

const createPaymentIntent = async (customerId: string, payload: ICreatePaymentPayload) => {
    // find rental order
    const rentalOrder = await prisma.rentalOrder.findUnique({
        where: {
            id: payload.rentalOrderId,
        },
    });

    if (!rentalOrder) {
        throw new Error("Rental order not found. Please check the rental order ID.");
    };

    // ownership check
    if (rentalOrder.customerId !== customerId) {
        throw new Error("You are not the owner of this rental order.");
    }

    // provider must confirm first before payment can be made
    // if (rentalOrder.status !== RentalStatus.CONFIRMED) {
    //     throw new Error("Payment cannot be made until the provider confirms the rental order.");
    // }

    // already paid check
    const completedPayment = await prisma.payment.findFirst({
        where: {
            rentalOrderId: rentalOrder.id,
            status: PaymentStatus.COMPLETED,
        },
    });

    if (completedPayment) {
        throw new Error("Payment has already been made for this rental order.");
    }

    // create stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(rentalOrder.totalAmount) * 100), // convert to cents
        currency: "bdt", // assuming BDT is the currency, adjust as needed
        metadata: {
            rentalOrderId: rentalOrder.id,
            customerId: rentalOrder.customerId,
            gearItemId: rentalOrder.gearItemId,
        },
    });

    // create payment record in database
    const paymentRecord = await prisma.payment.create({
        data: {
            transactionId: paymentIntent.id,
            rentalOrderId: rentalOrder.id,
            amount: rentalOrder.totalAmount,
            status: PaymentStatus.PENDING,
            method: PaymentMethod.CARD,
            provider: PaymentProvider.STRIPE,
            // clientSecret: paymentIntent.client_secret || "", // store client secret for frontend use
        },
    });

    return {
        paymentId: paymentRecord.id,
        clientSecret: paymentIntent.client_secret,
    };
};

export const paymentService = {
    createPaymentIntent,
};