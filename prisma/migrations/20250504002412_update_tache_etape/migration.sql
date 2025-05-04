/*
  Warnings:

  - Changed the type of `nom` on the `Tâches` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Tâches" DROP COLUMN "nom",
ADD COLUMN     "nom" TEXT NOT NULL;
