-- CreateTable
CREATE TABLE "AvatarFrame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvatarFrame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvatarFrame_isPublic_sort_idx" ON "AvatarFrame"("isPublic", "sort");

-- AlterTable: Add avatarFrameId and composedAvatarUrl to User
ALTER TABLE "User" ADD COLUMN "avatarFrameId" TEXT;
ALTER TABLE "User" ADD COLUMN "composedAvatarUrl" TEXT DEFAULT '';

-- CreateIndex
CREATE INDEX "User_avatarFrameId_idx" ON "User"("avatarFrameId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarFrameId_fkey" FOREIGN KEY ("avatarFrameId") REFERENCES "AvatarFrame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed: Copy existing avatarFrame string references to null (old string-based frame field will be deprecated)
-- The old `avatarFrame` column is kept for backward compatibility but no longer used