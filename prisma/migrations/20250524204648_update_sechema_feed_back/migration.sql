-- DropForeignKey
ALTER TABLE "FeedBack" DROP CONSTRAINT "FeedBack_idB_fkey";

-- DropForeignKey
ALTER TABLE "FeedBack" DROP CONSTRAINT "FeedBack_idR_fkey";

-- AlterTable
ALTER TABLE "FeedBack" ALTER COLUMN "idB" DROP NOT NULL,
ALTER COLUMN "idR" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_idB_fkey" FOREIGN KEY ("idB") REFERENCES "Binome"("idB") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedBack" ADD CONSTRAINT "FeedBack_idR_fkey" FOREIGN KEY ("idR") REFERENCES "Rapport"("idR") ON DELETE SET NULL ON UPDATE CASCADE;
