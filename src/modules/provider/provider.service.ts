import { prisma } from "../../lib/prisma";
import { ICreateGearItem, IUpdateGearItem } from "./provider.interface";

const createGearItem = async (providerId: string, payload: ICreateGearItem) => {
    // check category exists
    const category = await prisma.category.findUnique({
        where: {
            id: payload.categoryId
        }
    });

    if(!category) {
        throw new Error("Category with this ID does not exist");
    }

    // check duplicate gear item
    const existingGearItem = await prisma.gearItem.findFirst({
        where: {
            name: payload.name,
            categoryId: payload.categoryId,
        }
    });

    if(existingGearItem) {
        throw new Error("Gear item with this name already exists in this category");
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
        throw new Error("Gear item not found");
    }

    // check if the provider owns this gear item
    if(gearItem.providerId !== providerId) {
        throw new Error("You are not the owner of this gear item");
    }

    // category validation
    if (payload.categoryId) {
        const category = await prisma.category.findUnique({
            where: {
                id: payload.categoryId
            }
        });

        if (!category) {
            throw new Error("Category with this ID does not exist");
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

export const providerService = {
    createGearItem,
    updateGearItem
}