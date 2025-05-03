/*
  Warnings:

  - A unique constraint covering the columns `[roomId,userId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Client_roomId_key";

-- DropIndex
DROP INDEX "Client_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Client_roomId_userId_key" ON "Client"("roomId", "userId");
