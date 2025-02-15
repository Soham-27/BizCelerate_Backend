/*
  Warnings:

  - You are about to drop the column `membershipDiscounts` on the `Business` table. All the data in the column will be lost.
  - The `businessGoals` column on the `Business` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "membershipDiscounts",
DROP COLUMN "businessGoals",
ADD COLUMN     "businessGoals" TEXT[];
