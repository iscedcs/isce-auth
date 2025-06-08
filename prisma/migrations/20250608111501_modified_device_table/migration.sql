/*
  Warnings:

  - You are about to drop the column `nfcUid` on the `Device` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Device` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Device_nfcUid_key";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "nfcUid",
ADD COLUMN     "productId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "isActive" DROP NOT NULL,
ALTER COLUMN "isPrimary" DROP NOT NULL;

-- DropEnum
DROP TYPE "DeviceType";

-- CreateIndex
CREATE UNIQUE INDEX "Device_productId_key" ON "Device"("productId");
