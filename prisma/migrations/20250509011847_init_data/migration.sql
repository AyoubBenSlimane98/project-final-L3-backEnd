/*
  Warnings:

  - The values [PRESENT,ABSENT] on the enum `EtatPresence` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EtatPresence_new" AS ENUM ('Present', 'Absent');
ALTER TABLE "Presence" ALTER COLUMN "etat" TYPE "EtatPresence_new" USING ("etat"::text::"EtatPresence_new");
ALTER TABLE "Participation" ALTER COLUMN "etat" TYPE "EtatPresence_new" USING ("etat"::text::"EtatPresence_new");
ALTER TYPE "EtatPresence" RENAME TO "EtatPresence_old";
ALTER TYPE "EtatPresence_new" RENAME TO "EtatPresence";
DROP TYPE "EtatPresence_old";
COMMIT;
