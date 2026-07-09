import { GearCondition } from "../../../generated/prisma/enums";

export interface ICreateGear {
    categoryId: string;
    name: string;
    description: string;
    brand: string;
    condition: GearCondition;
    rentalPricePerDay: number;
    quantity: number;
    imageUrl?: string;
}