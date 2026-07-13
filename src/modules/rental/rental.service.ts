import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreateRentalOrder } from "./rental.interface";

const createRentalOrder = async (
  rentalData: ICreateRentalOrder,
  customerId: string,
) => {
  // check gear item exists
  const gearItem = await prisma.gearItem.findUnique({
    where: {
      id: rentalData.gearItemId,
    },
  });

  if (!gearItem) {
    // throw new Error("Gear item with this ID does not exist");
    const error: any = new Error("Gear item with this ID does not exist");
    error.statusCode = 404;
    throw error;
  }

  // check if gear item is available
  if (!gearItem.isAvailable) {
    const error: any = new Error("Gear item is not available for rental");
    error.statusCode = 400;
    throw error;
  }

  // check if requested quantity is available
  if (rentalData.quantity > gearItem.availableQuantity) {
    const error: any = new Error("Requested quantity is not available for rental");
    error.statusCode = 400;
    throw error;
  }

  // convert rentalStartDate and rentalEndDate to Date objects if they are strings
  if (typeof rentalData.rentalStartDate === "string") {
    rentalData.rentalStartDate = new Date(rentalData.rentalStartDate);
  }
  if (typeof rentalData.rentalEndDate === "string") {
    rentalData.rentalEndDate = new Date(rentalData.rentalEndDate);
  }

  // check duplicate rental orders unpaid by the same customer for the same gear item
  const existingRentalOrder = await prisma.rentalOrder.findFirst({
    where: {
      customerId,
      gearItemId: rentalData.gearItemId,
      status: RentalStatus.PLACED,
    },
  });

  if (existingRentalOrder) {
    const error: any = new Error("You already have an unpaid rental order for this gear item. Please complete the payment or cancel the existing order before placing a new one.");
    error.statusCode = 400;
    throw error;
  }

  // date validation
  if (rentalData.rentalStartDate >= rentalData.rentalEndDate) {
    const error: any = new Error("Rental start date must be before rental end date");
    error.statusCode = 400;
    throw error;
  }

  // total price calculation
  const milliseconds = rentalData.rentalEndDate.getTime() - rentalData.rentalStartDate.getTime(); 

  const totalDays = Math.ceil(
    milliseconds / (1000 * 3600 * 24),
  );

  const totalAmount =
    totalDays * rentalData.quantity * Number(gearItem.rentalPricePerDay);

  const rentalOrder = await prisma.$transaction(async (tx) => {
    // create rental order
    const newRentalOrder = await tx.rentalOrder.create({
      data: {
        customerId,
        gearItemId: rentalData.gearItemId,
        rentalStartDate: rentalData.rentalStartDate,
        rentalEndDate: rentalData.rentalEndDate,
        quantity: rentalData.quantity,
        totalAmount,
        status: RentalStatus.PLACED,
      },

      include: {
        gearItem: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.gearItem.update({
      where: {
        id: gearItem.id,
      },
      data: {
        availableQuantity: {
          decrement: rentalData.quantity,
        },
        isAvailable: gearItem.availableQuantity - rentalData.quantity > 0,
      },
    });

    return newRentalOrder;
  });

  return rentalOrder;
};

const getRentalOrders = async (customerId: string) => {
  const rentalOrders = await prisma.rentalOrder.findMany({
    where: {
      customerId,
    },

    orderBy: {
      rentalStartDate: "desc",
    },

    include: {
      gearItem: {
        include: {
          category: true,

          provider: {
            select: {
              id: true, 
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },

      payment: true,
    },
  });

  return rentalOrders;
};

const getRentalOrderById = async (customerId: string, rentalOrderId: string) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: {
      id: rentalOrderId,
    },

    include: {
      gearItem: {
        include: {
          category: true,
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: true,
    },
  });

  if (!rentalOrder ) {
    const error: any = new Error("Rental order not found");
    error.statusCode = 404;
    throw error;
    // throw new Error("Rental order not found");
  };

  if (rentalOrder.customerId !== customerId) {
    const error: any = new Error("You are not authorized to view this rental order");
    error.statusCode = 403;
    throw error;
  }

  return rentalOrder;
};

export const rentalOrderService = {
  createRentalOrder,
  getRentalOrders,
  getRentalOrderById,
};
