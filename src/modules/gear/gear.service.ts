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

export const gearService = {
    getAllGear
};