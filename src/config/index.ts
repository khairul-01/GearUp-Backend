import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.join(process.cwd(), ".env")});

export default {
    port: process.env.PORT || 3000,
    database_url: process.env.DATABASE_URL || "",
    app_url: process.env.APP_URL || "",
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
    jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET || "",
    jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET || "",
    jwt_access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "1d",
    jwt_refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
    node_env: process.env.NODE_ENV || "development",

    stripe_secret_key: process.env.STRIPE_SECRET_KEY || "",
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || "",
}