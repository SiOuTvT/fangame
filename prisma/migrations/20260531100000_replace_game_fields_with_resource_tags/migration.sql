-- AlterTable: Remove platform, language, fileSize columns (resourceTags never went live)
ALTER TABLE "Game" DROP COLUMN IF EXISTS "platform";
ALTER TABLE "Game" DROP COLUMN IF EXISTS "language";
ALTER TABLE "Game" DROP COLUMN IF EXISTS "fileSize";