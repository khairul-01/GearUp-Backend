import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IRegisterUser } from "./auth.interface";
import bcrypt from "bcrypt";

const registerUser = async (userData: IRegisterUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            email: userData.email
        }
    });

    if(isUserExists) {
        throw new Error ("User with this email already exists");
    };

    const hashedPassword = await bcrypt.hash(userData.password, Number(config.bcrypt_salt_rounds));

    const user = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
            profileImage: userData.profileImage,
            role: userData.role
        }
    });

    const userSend = await prisma.user.findUnique({
        where: {
            id: user.id,
            email: user.email || userData.email
        },
        omit: {
            password: true
        }
    });

    return userSend;
}

export const authService = {
    registerUser
};