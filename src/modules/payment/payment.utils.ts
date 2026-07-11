import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";

export const handlePaymentIntentSuccess = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  const paymentRecord = await prisma.payment.findFirst({
    where: {
      transactionId: paymentIntent.id,
    },
    include: {
      rentalOrder: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  if (!paymentRecord) {
    throw new Error(
      "Payment record not found. Please check the transaction ID.",
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    // update payment record
    await tx.payment.update({
      where: {
        id: paymentRecord.id,
      },
      data: {
        status: PaymentStatus.COMPLETED,
      },
    });

    // update rental order status
    await tx.rentalOrder.update({
      where: {
        id: paymentRecord.rentalOrderId,
      },
      data: {
        status: RentalStatus.PAID,
      },
    });

    // reduce the stock of the gear item after successful payment
    await tx.gearItem.update({
      where: {
        id: paymentRecord.rentalOrder.gearItemId,
      },
      data: {
        availableQuantity: {
          decrement: paymentRecord.rentalOrder.quantity,
        },
      },
    });
  });
};

