-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "advancedBookingLimit" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "maxBookingsPerUserPerDay" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "slotDuration" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "peak_schedule" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "peak_schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "peak_schedule" ADD CONSTRAINT "peak_schedule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
