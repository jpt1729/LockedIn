/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Client_userId_roomId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Client_roomId_key" ON "Client"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
