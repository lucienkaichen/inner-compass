-- DropForeignKey
ALTER TABLE "Analysis" DROP CONSTRAINT "Analysis_entryId_fkey";

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "aiReply" TEXT;

-- CreateTable
CREATE TABLE "EmotionGuide" (
    "id" SERIAL NOT NULL,
    "emotion" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmotionGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "sourceEntryId" INTEGER,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmotionGuide_emotion_key" ON "EmotionGuide"("emotion");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_sourceEntryId_fkey" FOREIGN KEY ("sourceEntryId") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
