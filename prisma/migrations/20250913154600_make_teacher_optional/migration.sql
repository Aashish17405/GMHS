-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "teacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
