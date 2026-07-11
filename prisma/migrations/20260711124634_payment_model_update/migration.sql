/*
  Warnings:

  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[transactionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[checkoutSessionId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "checkoutSessionId" TEXT,
ADD COLUMN     "checkoutUrl" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_checkoutSessionId_key" ON "payments"("checkoutSessionId");
