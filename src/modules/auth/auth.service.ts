import { emitWarning } from "node:process";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { ILoginUser, IRegisterUser } from "./auth.interface";
import bcrypt from "bcrypt";
import { jwtUtils } from "../../utils/jwtHelpers";
import { SignOptions } from "jsonwebtoken";

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
        throw new Error("Your account has been suspended. Please contact support");
    };

    // compare password
    const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
    if(!isPasswordMatched) {
        throw new Error("Invalid password or mail")
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

export const authService = {
    registerUser,
    loginUser
};