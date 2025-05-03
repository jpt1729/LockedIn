-- AlterTable
ALTER TABLE "Client" ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Client_id_key";
