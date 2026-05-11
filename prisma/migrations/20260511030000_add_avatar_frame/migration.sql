-- AlterTable: Add avatarFrame column to User table
ALTER TABLE "User" ADD COLUMN "avatarFrame" TEXT NOT NULL DEFAULT 'none';