/*
  Warnings:

  - Added the required column `dateDebut` to the `Tâches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateFin` to the `Tâches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Etudiant" ALTER COLUMN "idB" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tâches" ADD COLUMN     "dateDebut" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dateFin" TIMESTAMP(3) NOT NULL;
