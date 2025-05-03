/*
  Warnings:

  - You are about to drop the column `détails` on the `Cas` table. All the data in the column will be lost.
  - You are about to drop the column `titre` on the `Cas` table. All the data in the column will be lost.
  - Added the required column `acteur` to the `Cas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cas` to the `Cas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cas" DROP COLUMN "détails",
DROP COLUMN "titre",
ADD COLUMN     "acteur" TEXT NOT NULL,
ADD COLUMN     "cas" TEXT NOT NULL,
ALTER COLUMN "idB" DROP NOT NULL;
