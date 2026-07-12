import { GearCondition, RentalStatus } from "../../../generated/prisma/enums";

export interface ICreateGearItem {
    categoryId: string;
    name: string;
    description: string;
    brand: string;
    condition: GearCondition;
    rentalPricePerDay: number;
    quantity: number;
    imageUrl?: string;
}

export interface IUpdateGearItem {
    categoryId?: string;
    name?: string;
    description?: string;
    brand?: string;
    condition?: GearCondition;
    rentalPricePerDay?: number;
    quantity?: number;
    imageUrl?: string;
    availableQuantity?: number;
}

export interface IUpdateGearItemStatus {
    status: RentalStatus
}