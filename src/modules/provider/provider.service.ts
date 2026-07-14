import { Prisma } from "../../../generated/prisma/client.js";
import { RentalStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { ICreateGearItem, IUpdateGearItem, IUpdateGearItemStatus } from "./provider.interface.js";

const createGearItem = async (providerId: string, payload: ICreateGearItem) => {
    // check category exists
    const category = await prisma.category.findUnique({
        where: {
            id: payload.categoryId
        }
    });

    if(!category) {
        const error: any = new Error("Category with this ID does not exist");
        error.statusCode = 404;
        throw error;
        // throw new Error("Category with this ID does not exist");
    }

    // check duplicate gear item
    const existingGearItem = await prisma.gearItem.findFirst({
        where: {
            name: payload.name,
            categoryId: payload.categoryId,
        }
    });

    if(existingGearItem) {
        const error: any = new Error("Gear item with this name already exists in this category");
        error.statusCode = 400;
        throw error;
    };

    const gearItem = await prisma.gearItem.create({
        data: {
            providerId,
            categoryId: payload.categoryId,
            name: payload.name,
            description: payload.description,
            brand: payload.brand,
            condition: payload.condition,
            rentalPricePerDay: payload.rentalPricePerDay,
            quantity: payload.quantity,
            availableQuantity: payload.quantity,
            isAvailable: payload.quantity > 0 ? true : false,
            imageUrl: payload.imageUrl
        },

        include: {
            category: true,

            provider: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    return gearItem;
};

const updateGearItem = async (gearId: string, providerId: string, payload: IUpdateGearItem) => {
    // check gear item exists
    const gearItem = await prisma.gearItem.findUnique({
        where: {
            id: gearId
        }
    });

    if(!gearItem) {
        const error: any = new Error("Gear item not found");
        error.statusCode = 404;
        throw error;
    }

    // check if the provider owns this gear item
    if(gearItem.providerId !== providerId) {
        const error: any = new Error("You are not the owner of this gear item");
        error.statusCode = 403;
        throw error;
    }

    // category validation
    if (payload.categoryId) {
        const category = await prisma.category.findUnique({
            where: {
                id: payload.categoryId
            }
        });

        if (!category) {
            const error: any = new Error("Category with this ID does not exist");
            error.statusCode = 404;
            throw error;
        }
    };

    const availableQuantity = payload.quantity !== undefined ? payload.quantity : gearItem.availableQuantity;

    const updatedGearItem = await prisma.gearItem.update({
        where: {
            id: gearId
        },
        data: {
            ...payload,

            isAvailable: availableQuantity > 0 ? true : false,
        },

        include: {
            category: true,
            provider: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    return updatedGearItem;
};

const deleteGearItem = async (gearId: string, providerId: string) => {
    // check gear item exists
    const gearItem = await prisma.gearItem.findUnique({
        where: {
            id: gearId
        }
    });

    if(!gearItem) {
        const error: any = new Error("Gear item not found");
        error.statusCode = 404;
        throw error;
    }

    // check if the provider owns this gear item
    if(gearItem.providerId !== providerId) {
        const error: any = new Error("You are not the owner of this gear item. You only can delete your own gear items");
        error.statusCode = 403;
        throw error;
    };

    // check active rentals for this gear item
    const activeRentals = await prisma.rentalOrder.findFirst({
        where: {
            gearItemId: gearId,
            status: {
                in: [
                    RentalStatus.PLACED,
                    RentalStatus.CONFIRMED,
                    RentalStatus.PICKED_UP,
                    RentalStatus.PAID
                ]
            }}
    });

    if(activeRentals) {
        const error: any = new Error("This gear item has active rentals. You cannot delete it until all rentals are completed or cancelled");
        error.statusCode = 400;
        throw error;
    }

    await prisma.gearItem.delete({
        where: {
            id: gearId
        }
    });

    return null;
};

const getProvidersOrders = async (providerId: string, query: Record<string, any>) => {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    // in whereCondition set providerId 
    const whereCondition: Prisma.RentalOrderWhereInput = {
        gearItem: {
            providerId: providerId
        }
    };

    if (query.status) {
        whereCondition.status = query.status as RentalStatus;
    };

    if (query.startDate && query.endDate) {
        whereCondition.rentalStartDate = {
            gte: new Date(query.startDate)
        };
        whereCondition.rentalEndDate = {
            lte: new Date(query.endDate)
        };
    }

    const [orders, totalCount] = await prisma.$transaction([
        prisma.rentalOrder.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                createdAt:"desc"
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                gearItem: {
                    include: {
                        category: true
                    }
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        provider: true,
                        paidAt: true
                    }
                }
            }
        }),
        prisma.rentalOrder.count({
            where: whereCondition
        })
    ]);

    return {
        meta: {
            page,
            limit,
            total: totalCount,
            totalPage: Math.ceil(totalCount / limit)
        },
        data: orders
    };
};

const updateRentalOrderStatus = async (rentalOrderId: string, providerId: string, payload: IUpdateGearItemStatus) => {
    // check rental order exists
    const rentalOrder = await prisma.rentalOrder.findFirst({
        where: {
            id: rentalOrderId,
            gearItem: {
                providerId: providerId
            }
        },
        include: {
            gearItem: true
        }
    });

    if(!rentalOrder) {
        const error: any = new Error("Rental order not found");
        error.statusCode = 404;
        throw error;
    };

    const currentStatus = rentalOrder.status;
    const newStatus = payload.status;

    // Allowed status transitions
    const allowedTransitions: Record<RentalStatus, RentalStatus[]> = {
        PLACED: ["CONFIRMED"],
        CONFIRMED: [],
        PAID: ["RETURNED"],
        PICKED_UP: ["RETURNED"],
        RETURNED: [],
        CANCELLED: []
    }

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
        const error: any = new Error(`[${currentStatus} -> ${newStatus}] Invalid status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions[currentStatus].join(", ")}.`);
        error.statusCode = 400;
        throw error;
    };

    const updatedRentalOrder = await prisma.$transaction(async (tx) => {
        // Update the rental order status
        const updatedOrder = await tx.rentalOrder.update({
            where: {
                id: rentalOrderId
            },
            data: {
                status: newStatus
            },
            include: {
                customer: true,
                gearItem: true,
            }
        });

        // increase stock when the order is returned
        if (newStatus === RentalStatus.RETURNED) {
            await tx.gearItem.update({
                where: {
                    id: rentalOrder.gearItemId
                },
                data: {
                    availableQuantity: {
                        increment: rentalOrder.quantity
                    }
                }
            });
        }

        return updatedOrder;
    });

    return updatedRentalOrder;
};

export const providerService = {    
    createGearItem,
    updateGearItem,
    deleteGearItem,
    getProvidersOrders,
    updateRentalOrderStatus
}
