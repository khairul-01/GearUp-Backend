import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./admin.interface";

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

export const adminService = {
    createCategory
}