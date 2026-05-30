CREATE TABLE "security_staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileImage" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_staff_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "security_staff_userId_key" ON "security_staff"("userId");

ALTER TABLE "security_staff" ADD CONSTRAINT "security_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
