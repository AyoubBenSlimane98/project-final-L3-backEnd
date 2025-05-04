/*
  Warnings:

  - You are about to drop the column `idS` on the `Rapport` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idR]` on the table `Sujet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Rapport" DROP CONSTRAINT "Rapport_idS_fkey";

-- DropIndex
DROP INDEX "Rapport_idS_key";

-- AlterTable
ALTER TABLE "Rapport" DROP COLUMN "idS";

-- AlterTable
ALTER TABLE "Sujet" ADD COLUMN     "idR" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Sujet_idR_key" ON "Sujet"("idR");

-- AddForeignKey
ALTER TABLE "Sujet" ADD CONSTRAINT "Sujet_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE SET NULL ON UPDATE CASCADE;
