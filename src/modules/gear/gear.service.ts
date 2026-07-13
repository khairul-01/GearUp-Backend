import { create } from "node:domain";
import { GearItemWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGearQueryParams } from "./gear.interface";

const getAllGear = async (query: IGearQueryParams) => {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const whereCondition: GearItemWhereInput = {};

    // search by gear name
    if (query.search) {
        whereCondition.name = {
            contains: query.search,
            mode: "insensitive",
        }
    };

    // category filter
    if (query.categoryId) {
        whereCondition.categoryId = query.categoryId;
    };

    // brand
    if (query.brand) {
        whereCondition.brand = {
            equals: query.brand as string,
            mode: "insensitive",
        }
    };

    // price range filter
    if (query.minPrice || query.maxPrice) {
        whereCondition.rentalPricePerDay = {};
        if (query.minPrice) {
            whereCondition.rentalPricePerDay.gte = Number(query.minPrice);
        }
        if (query.maxPrice) {
            whereCondition.rentalPricePerDay.lte = Number(query.maxPrice);
        }
    }

    // availability filter
    if(query.available === "true") {
        whereCondition.availableQuantity = {
            gt: 0
        }
    };

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const [gearItems, totalCount] = await prisma.$transaction([
        prisma.gearItem.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },

            include: {
                category: true,
                provider: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true
                    }
                }
            }
        }),

        prisma.gearItem.count({
            where: whereCondition
        })
    ]);

    return {
        meta : {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        },
        data: gearItems
    };

};

const getGearById = async (gearId: string) => {
    
    const gearItem = await prisma.gearItem.findFirst({
        where: {
            id: gearId
        },

        include: {
            category: true,
            provider: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                },
            },

            reviews: {
                orderBy: {
                    createdAt: "desc"
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        }
    });

    if (!gearItem) {
        throw new Error("Gear item not found");
    };

    // const totalReviews = gearItem.reviews.length;
    // const averageRating = totalReviews === 0 ? 0 : gearItem.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;

    const reviewStatistics = await prisma.review.aggregate({
        where: {
            gearItemId: gearId
        },
        _count: {
            _all: true
        },
        _avg: {
            rating: true
        }
    });

    return {
        ...gearItem,
        totalReviews: reviewStatistics._count._all,
        averageRating: Number(reviewStatistics._avg.rating?.toFixed(1)) // Round to 1 decimal place
    }
};

const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        where: {
            isActive: true
        },

        orderBy: {
            name: "asc"
        },

        include: {
            _count: {
                select: {
                    gearItems: true
                }
            }
        }
    });

    return categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        gearItemCount: category._count.gearItems,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    }));
};

export const gearService = {
    getAllGear,
    getGearById,
    getAllCategories
};