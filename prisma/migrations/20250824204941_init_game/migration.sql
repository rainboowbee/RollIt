-- AlterTable
ALTER TABLE "public"."Game" ADD COLUMN     "gameStartTime" TIMESTAMP(3) NOT NULL DEFAULT (now() + interval '30 seconds');
