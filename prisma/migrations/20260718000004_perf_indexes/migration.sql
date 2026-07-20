-- Performance indexes for admin queries
CREATE INDEX IF NOT EXISTS "Achievement_createdAt_idx" ON "Achievement"("createdAt");
CREATE INDEX IF NOT EXISTS "Creator_createdAt_idx" ON "Creator"("createdAt");
CREATE INDEX IF NOT EXISTS "Music_createdAt_idx" ON "Music"("createdAt");
CREATE INDEX IF NOT EXISTS "GameReport_createdAt_idx" ON "GameReport"("createdAt");
