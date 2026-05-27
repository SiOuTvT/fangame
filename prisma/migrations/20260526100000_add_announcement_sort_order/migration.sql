-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Update existing records with sequential sortOrder based on createdAt
UPDATE "Announcement" SET "sortOrder" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) - 1 AS rn
  FROM "Announcement"
) sub
WHERE "Announcement".id = sub.id;