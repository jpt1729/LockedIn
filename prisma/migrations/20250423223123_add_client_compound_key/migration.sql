/*
  Warnings:

  - A unique constraint covering the columns `[userId,roomId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Made the column `roomId` on table `Client` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_roomId_fkey";

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "roomId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_roomId_key" ON "Client"("userId", "roomId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
