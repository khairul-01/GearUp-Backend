import { UserStatus } from "../../../generated/prisma/enums";
import { GearItemWhereInput, RentalOrderWhereInput, UserWhereInput } from "../../../generated/prisma/models";

export interface ICreateCategory {
    name: string;
    description: string;
}

export interface IQueryParams extends UserWhereInput {
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

export interface IUpdateUserStatus {
    status: UserStatus;
};

// for get all gear query params
export interface IGearQueryParams extends GearItemWhereInput {
    search?: string;
    page?: string;
    limit?: string;
    minPrice?: string;
    maxPrice?: string;
    available?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// rental order query params
export interface IRentalOrderQueryParams extends RentalOrderWhereInput {
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}