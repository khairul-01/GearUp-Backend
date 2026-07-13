import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import { GearItemWhereInput, RentalOrderWhereInput, UserWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateCategory, IGearQueryParams, IQueryParams, IRentalOrderQueryParams, IUpdateUserStatus } from "./admin.interface";

const createCategory = async (payload: ICreateCategory) => {
    // check duplicate category
    const existingCategory = await prisma.category.findUnique({
        where: {
            name: payload.name
        },
    });

    if(existingCategory) {
        throw new Error("Category with this name already exists");
    };

    const category = await prisma.category.create({
        data: {
            name: payload.name,
            description: payload.description
        }
    });
    return category;
};

const getAllUsers = async (queryParams: IQueryParams) => {
    const page = queryParams.page ? Number(queryParams.page) : 1;
    const limit = queryParams.limit ? Number(queryParams.limit) : 10;
    const skip = (page - 1) * limit;

    const whereCondition: UserWhereInput = {};

    // search by user name or email
    if (queryParams.search) {
        whereCondition.OR = [
            { name: { contains: queryParams.search, mode: "insensitive" } },
            { email: { contains: queryParams.search, mode: "insensitive" } }
        ];
    };

    // filter by role
    if (queryParams.role) {
        whereCondition.role = queryParams.role as UserRole;
    };

    // filter by status
    if (queryParams.status) {
        whereCondition.status = queryParams.status as UserStatus;
    };

    const [users, totalCount] = await prisma.$transaction([
        prisma.user.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                [queryParams.sortBy || "createdAt"]: queryParams.sortOrder || "desc"
            },

            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            },
        }),

        prisma.user.count({
            where: whereCondition,
        }),
    ]);

    return {
        meta: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
        data: users,
    }
};

const updateUserStatus = async (userId: string, adminId: string, payload: IUpdateUserStatus) => {
    // prevent admin from updating their own status
    if (userId === adminId) {
        throw new Error("You cannot update your own status");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            status: payload.status
        },
        omit: {
            password: true,
            profileImage: true,
            createdAt: true,
        }
    });
    return updatedUser;
};

// get all gear with query params
const getAllGear = async (queryParams: IGearQueryParams) => {
    const page = queryParams.page ? Number(queryParams.page) : 1;
    const limit = queryParams.limit ? Number(queryParams.limit) : 10;
    const skip = (page - 1) * limit;

    const whereCondition: GearItemWhereInput = {};

    // search by gear name or description
    if (queryParams.search) {
        whereCondition.OR = [
            { name: { contains: queryParams.search, mode: "insensitive" } },
            { description: { contains: queryParams.search, mode: "insensitive" } },
            {brand: { contains: queryParams.search, mode: "insensitive" } }
        ];
    };

    // filter by category
    if (queryParams.categoryId) {
        whereCondition.categoryId = queryParams.categoryId;
    };

    // filter by price range
    if (queryParams.minPrice || queryParams.maxPrice) {
        whereCondition.rentalPricePerDay = {};
        if (queryParams.minPrice) {
            whereCondition.rentalPricePerDay.gte = Number(queryParams.minPrice);
        }
        if (queryParams.maxPrice) {
            whereCondition.rentalPricePerDay.lte = Number(queryParams.maxPrice);
        }
    };

    // filter by availability
    if (queryParams.available) {
        whereCondition.availableQuantity = queryParams.available === "true" ? { gt: 0 } : { equals: 0 };
    };

    // filter by providerId
    if (queryParams.providerId) {
        whereCondition.providerId = queryParams.providerId;
    }

    const sortBy = queryParams.sortBy || "createdAt";
    const sortOrder = queryParams.sortOrder || "desc";

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
                        name: true,
                        email: true,
                        phone: true,
                    }
                },

                _count: {
                    select: {
                        reviews: true
                    }
                }
            }
        }),
        prisma.gearItem.count({
            where: whereCondition
        })
    ]);

    return {
        meta: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        },
        data: gearItems
    };
};

// get all rental orders with query params
const getAllRentalOrders = async (queryParams: IRentalOrderQueryParams) => {
    const page = queryParams.page ? Number(queryParams.page) : 1;
    const limit = queryParams.limit ? Number(queryParams.limit) : 10;
    const skip = (page - 1) * limit;

    const whereCondition: RentalOrderWhereInput = {};

    // search by gear name or customer name
    if (queryParams.search) {
        whereCondition.OR = [
            {
                customer: {
                    name: { contains: queryParams.search, mode: "insensitive" }
                },
                
            },
            {
                customer: {
                    email: {
                        contains: queryParams.search, mode: "insensitive"
                    }
                }
            },
            {
                gearItem: {
                    name: { contains: queryParams.search, mode: "insensitive" }
                }
            },
            {
                gearItem: {
                    description: { contains: queryParams.search, mode: "insensitive" }
                }
            }
        ];
    };

    // filter by status
    if (queryParams.status) {
        whereCondition.status = queryParams.status;
    };

    // customerId filter
    if (queryParams.customerId) {
        whereCondition.customerId = queryParams.customerId;
    };

    // rental status filter
    if (queryParams.status) {
        whereCondition.status = queryParams.status;
    };

    const sortBy = queryParams.sortBy || "createdAt";
    const sortOrder = queryParams.sortOrder || "desc";

    const [rentalOrders, totalCount] = await prisma.$transaction([
        prisma.rentalOrder.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                gearItem: {
                    include: {
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true
                            }
                        },
                        category: true
                    }
                },
                payment: true
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
            totalPages: Math.ceil(totalCount / limit)
        },
        data: rentalOrders
    };
};

export const adminService = {
    createCategory,
    getAllUsers,
    updateUserStatus,
    getAllGear,
    getAllRentalOrders
};