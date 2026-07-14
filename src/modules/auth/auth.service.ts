import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { ILoginUser, IRegisterUser } from "./auth.interface.js";
import bcrypt from "bcrypt";
import { jwtUtils } from "../../utils/jwtHelpers.js";
import { SignOptions } from "jsonwebtoken";

const registerUser = async (userData: IRegisterUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            email: userData.email
        }
    });

    if(isUserExists) {
        const error: any = new Error ("User with this email already exists");
        error.statusCode = 400;
        throw error;
    };

    const hashedPassword = await bcrypt.hash(userData.password, Number(config.bcrypt_salt_rounds));

    const user = await prisma.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            phone: userData.phone,
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
};

const loginUser = async (payload: ILoginUser) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email
        }
    });

    // account status
    if(user.status === "SUSPENDED") {
        const error: any = new Error("Your account has been suspended. Please contact support");
        error.statusCode = 403;
        throw error;
    };

    // compare password
    const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
    if(!isPasswordMatched) {
        const error: any = new Error("Invalid password or email");
        error.statusCode = 401;
        throw error;
    };

    // Generate jwt 
    const payloadForToken = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };

    const accessToken = jwtUtils.createToken(
        payloadForToken, 
        config.jwt_access_token_secret,
        config.jwt_access_token_expires_in as SignOptions
    );

    // Remove password from response
    const {password, ...userWithoutPassword} = user;

    return {
        accessToken,
        user: userWithoutPassword
    };
};

const getMyself = async (userId: string) => {

    const user = await prisma.user.findUniqueOrThrow({
        where:{
            id: userId
        },
        omit: {
            password: true
        }
    });

    return user;
}

export const authService = {
    registerUser,
    loginUser,
    getMyself
};