import Stripe from "stripe";
import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  RentalStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICreatePaymentPayload, IQueryMyPayments } from "./payment.interface";

const createPaymentIntent = async (
  customerId: string,
  payload: ICreatePaymentPayload,
) => {
  // find rental order
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: {
      id: payload.rentalOrderId,
    },
  });

  if (!rentalOrder) {
    throw new Error(
      "Rental order not found. Please check the rental order ID.",
    );
  }

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
    paymentIntentId: paymentIntent.id,
    amount: paymentRecord.amount,
    status: paymentRecord.status,
  };
};

const createPaymentSession = async (
  customerId: string, rentalOrderId: string) => {
    const rentalOrder = await prisma.rentalOrder.findUnique({
      where: {
        id: rentalOrderId,
      },
      include: {
        gearItem: true,
      },
    });

    if (!rentalOrder) {
      const error: any = new Error(
        "Rental order not found. Please check the rental order ID.",
      );
      error.statusCode = 404;
      throw error;
    };

    // ownership check
    if (rentalOrder.customerId !== customerId) {
      const error: any = new Error("You are not the owner of this rental order.");
      error.statusCode = 403;
      throw error;
    };

    // if(rentalOrder.status !== RentalStatus.CONFIRMED) {
    //   throw new Error("Payment cannot be made until the provider confirms the rental order.");
    // }

    // existing payment check
    const existingPayment = await prisma.payment.findFirst({
      where: {
        rentalOrderId: rentalOrder.id,
        status: PaymentStatus.PENDING,
      },
    });

    if (existingPayment) {
      const error: any = new Error("A payment is already pending for this rental order.");
      error.statusCode = 400;
      throw error;
    };

    // create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: rentalOrder.gearItem.name,
                        description: `${rentalOrder.totalAmount} BDT for ${rentalOrder.quantity} ${rentalOrder.gearItem.name}(s)`,
                    },
                    unit_amount: Math.round(Number(rentalOrder.totalAmount) * 100), // convert to cents
                },
                quantity: 1,
            }
        ],
        success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app_url}/payment/cancel`,
        metadata: {
            rentalOrderId: rentalOrder.id,
            customerId: rentalOrder.customerId,
            gearItemId: rentalOrder.gearItemId,
        },
    });

    // create payment record in database
    const paymentRecord = await prisma.payment.create({
        data: {
            transactionId: session.payment_intent?.toString() || "", // store the payment intent ID from the session
            rentalOrderId: rentalOrder.id,
            amount: rentalOrder.totalAmount,
            status: PaymentStatus.PENDING,
            method: PaymentMethod.CARD,
            provider: PaymentProvider.STRIPE,
            checkoutSessionId: session.id,
            checkoutUrl: session.url || "", // store checkout URL for frontend use
        },
    });

    return {
        paymentId: paymentRecord.id,
        checkoutUrl: session.url,
    };
};

const confirmPayment = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  switch (event.type) {
    case "checkout.session.completed": {

      const session = event.data.object as Stripe.Checkout.Session;

      const payment = await prisma.payment.findUnique({
        where: {
          checkoutSessionId: session.id,
        },
        include: {
            rentalOrder: true,
        }
      });

        if (!payment) {
          console.error("Payment record not found for completed checkout session.");
          return;
        }

        await prisma.$transaction(async (tx) => {
            // update payment record
            await tx.payment.update({
                where: {
                    id: payment.id,
                },
                data: {
                    status: PaymentStatus.COMPLETED,
                    transactionId: session.payment_intent?.toString(), // to store the payment intent ID from the session
                    paidAt: new Date(),
                },
            });

            // update rental order status
            await tx.rentalOrder.update({
                where: {
                    id: payment.rentalOrderId,
                },
                data: {
                    status: RentalStatus.PAID,
                },
            });

            // reduce the stock of the gear item after successful payment
            await tx.gearItem.update({
                where: {
                    id: payment.rentalOrder.gearItemId,
                },
                data: {
                    availableQuantity: {
                        decrement: payment.rentalOrder.quantity,
                    },
                },
            });
        });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;

      await prisma.payment.updateMany({
        where: {
          checkoutSessionId: session.id,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
};

const getMyPayments = async (customerId: string, query: IQueryMyPayments) => {
    const page = query.page ? Number(query.page) || 1 : 1;
    const limit = query.limit ? Number(query.limit) || 10 : 10;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "desc" ? "desc" : "asc";

    const skip = (page - 1) * limit;

    const whereCondition = {
        rentalOrder: {
            customerId: customerId,
        }
    };

    const [payments, total] = await prisma.$transaction([
        prisma.payment.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                rentalOrder: {
                    include: {
                        gearItem: {
                            include: {
                                category: true,
                            }
                        }
                    },
                }
            },
        }),
        prisma.payment.count({
            where: whereCondition,
        })
    ]);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: payments,
    }
};

// Get a specific payment by ID for the authenticated customer
const getPaymentById = async (customerId: string, paymentId: string) => {
    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            rentalOrder: {
                customerId: customerId
            }
        },
        include: {
            rentalOrder: {
                include: {
                    gearItem: {
                        include: {
                            category: true,
                            provider: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                }
                            }
                        }
                    },
                    
                },
                
            }
        }
    });

    if (!payment) {
        const error: any = new Error("Payment not found or you do not have access to this payment.");
        error.statusCode = 404;
        throw error;
    };

    return payment;
};

export const paymentService = {
  createPaymentIntent,
  confirmPayment,
  createPaymentSession,
  getMyPayments,
  getPaymentById
};
