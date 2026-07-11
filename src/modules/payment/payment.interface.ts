import { PaymentWhereInput } from "../../../generated/prisma/models";

export interface ICreatePaymentPayload {
  rentalOrderId: string;
};

export interface IQueryMyPayments extends PaymentWhereInput {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}