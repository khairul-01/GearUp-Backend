import { GearItemWhereInput } from "../../../generated/prisma/models";

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