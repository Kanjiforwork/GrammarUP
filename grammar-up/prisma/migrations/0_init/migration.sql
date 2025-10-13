-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ContentSource" AS ENUM ('OFFICIAL', 'USER_CREATED');

-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('A1', 'A2', 'B1', 'B2');

-- CreateEnum
CREATE TYPE "public"."QType" AS ENUM ('MCQ', 'CLOZE', 'ORDER', 'TRANSLATE');

-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lessonId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "source" "public"."ContentSource" NOT NULL DEFAULT 'OFFICIAL',

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExerciseQuestion" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "unitId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "type" "public"."QType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "level" "public"."Level",
    "lessonId" TEXT,
    "explain" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "source" "public"."ContentSource" NOT NULL DEFAULT 'OFFICIAL',

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "avatar" INTEGER NOT NULL DEFAULT 1,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "highestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "currentUnit" TEXT,
    "completedLessons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedExercises" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "theme" "public"."Theme" NOT NULL DEFAULT 'SYSTEM',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attempt_questionId_idx" ON "public"."Attempt"("questionId" ASC);

-- CreateIndex
CREATE INDEX "Attempt_userId_createdAt_idx" ON "public"."Attempt"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "public"."Attempt"("userId" ASC);

-- CreateIndex
CREATE INDEX "Attempt_userId_isCorrect_idx" ON "public"."Attempt"("userId" ASC, "isCorrect" ASC);

-- CreateIndex
CREATE INDEX "Exercise_createdById_idx" ON "public"."Exercise"("createdById" ASC);

-- CreateIndex
CREATE INDEX "Exercise_lessonId_sortOrder_idx" ON "public"."Exercise"("lessonId" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE INDEX "Exercise_source_idx" ON "public"."Exercise"("source" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseQuestion_exerciseId_questionId_key" ON "public"."ExerciseQuestion"("exerciseId" ASC, "questionId" ASC);

-- CreateIndex
CREATE INDEX "ExerciseQuestion_exerciseId_sortOrder_idx" ON "public"."ExerciseQuestion"("exerciseId" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE INDEX "ExerciseQuestion_questionId_idx" ON "public"."ExerciseQuestion"("questionId" ASC);

-- CreateIndex
CREATE INDEX "Lesson_unitId_sortOrder_idx" ON "public"."Lesson"("unitId" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE INDEX "Question_concept_idx" ON "public"."Question"("concept" ASC);

-- CreateIndex
CREATE INDEX "Question_createdById_idx" ON "public"."Question"("createdById" ASC);

-- CreateIndex
CREATE INDEX "Question_lessonId_idx" ON "public"."Question"("lessonId" ASC);

-- CreateIndex
CREATE INDEX "Question_level_idx" ON "public"."Question"("level" ASC);

-- CreateIndex
CREATE INDEX "Question_source_idx" ON "public"."Question"("source" ASC);

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "public"."Question"("type" ASC);

-- CreateIndex
CREATE INDEX "Unit_sortOrder_idx" ON "public"."Unit"("sortOrder" ASC);

-- CreateIndex
CREATE INDEX "User_currentUnit_idx" ON "public"."User"("currentUnit" ASC);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "User_lastActiveDate_idx" ON "public"."User"("lastActiveDate" ASC);

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseQuestion" ADD CONSTRAINT "ExerciseQuestion_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExerciseQuestion" ADD CONSTRAINT "ExerciseQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

