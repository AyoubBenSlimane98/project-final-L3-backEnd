/*
  Warnings:

  - You are about to drop the column `rapportEtapeId` on the `Etape` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idR]` on the table `Etape` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idR` to the `Etape` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Etape" DROP CONSTRAINT "Etape_rapportEtapeId_fkey";

-- DropIndex
DROP INDEX "Etape_rapportEtapeId_key";

-- AlterTable
ALTER TABLE "Etape" DROP COLUMN "rapportEtapeId",
ADD COLUMN     "idR" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Etape_idR_key" ON "Etape"("idR");

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_idR_fkey" FOREIGN KEY ("idR") REFERENCES "RapportEtape"("idR") ON DELETE RESTRICT ON UPDATE CASCADE;
