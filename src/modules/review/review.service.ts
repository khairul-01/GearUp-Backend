import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const createReview = async (customerId: string, payload: ICreateReviewPayload) => {
    const rentalOrder = await prisma.rentalOrder.findFirst({
        where: {
            id: payload.rentalOrderId,
            customerId: customerId
        },
        include: {
            gearItem: true
        }
    });

    if (!rentalOrder) {
        throw new Error("Rental order not found or you do not have access to this rental order.");
    };

    if (rentalOrder.status !== RentalStatus.RETURNED) {
        throw new Error("You can only review a rental order only after that has been returned.");
    };

    const existingReview = await prisma.review.findFirst({
        where: {
            gearItemId: rentalOrder.gearItemId,
        }
    });

    if (existingReview) {
        throw new Error("You have already reviewed this rental order.");
    }

    const review = await prisma.review.create({
        data: {
            customerId: customerId,
            gearItemId: rentalOrder.gearItemId,
            rating: payload.rating,
            comment: payload.comment
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                }
            },
            gearItem: {
                select: {
                    id: true,
                    name: true,
                    brand: true,
                }
            }
        }
    });

    return review;
};

export const reviewService = {
    createReview,
};