-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetCustomer" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "currentPainPoints" TEXT[],
    "businessGoals" TEXT NOT NULL,
    "membershipDiscounts" BOOLEAN NOT NULL,
    "offers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");
