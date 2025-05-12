/*
  Warnings:

  - You are about to drop the column `description` on the `EvaluationRaport` table. All the data in the column will be lost.
  - You are about to drop the column `idR` on the `Sujet` table. All the data in the column will be lost.
  - Added the required column `statut` to the `EvaluationRaport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EtatRapport" AS ENUM ('Accepté', 'Rejeté');

-- DropForeignKey
ALTER TABLE "Sujet" DROP CONSTRAINT "Sujet_idR_fkey";

-- DropIndex
DROP INDEX "Sujet_idR_key";

-- AlterTable
ALTER TABLE "EvaluationRaport" DROP COLUMN "description",
ADD COLUMN     "statut" "EtatRapport" NOT NULL;

-- AlterTable
ALTER TABLE "Sujet" DROP COLUMN "idR";
