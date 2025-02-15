-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "isNewUser" BOOLEAN NOT NULL DEFAULT true,
    "purchaseFrequency" INTEGER DEFAULT 0,
    "averageOrderValue" DOUBLE PRECISION DEFAULT 0,
    "frequentItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentTier" TEXT DEFAULT 'Bronze',
    "pointsBalance" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_businessId_idx" ON "User"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "User_businessId_username_key" ON "User"("businessId", "username");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
