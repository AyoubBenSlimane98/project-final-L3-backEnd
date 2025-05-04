/*
  Warnings:

  - You are about to drop the column `description` on the `Tâches` table. All the data in the column will be lost.
  - Added the required column `nom` to the `Etape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Tâches` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EtapeNom" AS ENUM ('Analyse', 'Conception', 'Developpement');

-- CreateEnum
CREATE TYPE "TacheNom" AS ENUM ('DiagrammeCasUtilisation', 'DescriptionTextuelle', 'DescriptionGraphique', 'DiagrammeClasseParticipative', 'IHM', 'DiagrammeClasse', 'DiagrammeSequenceDetaille', 'Developpement');

-- DropForeignKey
ALTER TABLE "Etudiant" DROP CONSTRAINT "Etudiant_idB_fkey";

-- AlterTable
ALTER TABLE "Etape" ADD COLUMN     "nom" "EtapeNom" NOT NULL,
ALTER COLUMN "dateDebut" DROP NOT NULL,
ALTER COLUMN "dateFin" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tâches" DROP COLUMN "description",
ADD COLUMN     "idEtape" INTEGER,
ADD COLUMN     "nom" "TacheNom" NOT NULL,
ALTER COLUMN "dateDebut" DROP NOT NULL,
ALTER COLUMN "dateFin" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tâches" ADD CONSTRAINT "Tâches_idEtape_fkey" FOREIGN KEY ("idEtape") REFERENCES "Etape"("idEtape") ON DELETE SET NULL ON UPDATE CASCADE;
