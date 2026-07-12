-- CreateTable: CuratedCollection
CREATE TABLE "CuratedCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CuratedCollectionGame
CREATE TABLE "CuratedCollectionGame" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CuratedCollectionGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CuratedCollection_sortOrder_idx" ON "CuratedCollection"("sortOrder");
CREATE UNIQUE INDEX "CuratedCollectionGame_collectionId_gameId_key" ON "CuratedCollectionGame"("collectionId", "gameId");
CREATE INDEX "CuratedCollectionGame_collectionId_idx" ON "CuratedCollectionGame"("collectionId");
CREATE INDEX "CuratedCollectionGame_gameId_idx" ON "CuratedCollectionGame"("gameId");

-- AddForeignKey
ALTER TABLE "CuratedCollectionGame" ADD CONSTRAINT "CuratedCollectionGame_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "CuratedCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CuratedCollectionGame" ADD CONSTRAINT "CuratedCollectionGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
