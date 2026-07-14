-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- Alter column type from TEXT to UserRole (existing rows cast to the enum)
ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole" USING "role"::text::"UserRole",
ALTER COLUMN "role" SET DEFAULT 'USER';