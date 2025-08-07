/*
  Warnings:

  - You are about to drop the column `maxBookingsPerUserPerDay` on the `courts` table. All the data in the column will be lost.
  - You are about to drop the column `slotDuration` on the `courts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courts" DROP COLUMN "maxBookingsPerUserPerDay",
DROP COLUMN "slotDuration";
