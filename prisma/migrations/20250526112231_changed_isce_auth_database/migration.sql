-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('CARD', 'STICKER', 'WRISTBAND', 'QR');

-- CreateEnum
CREATE TYPE "PrivacyLevel" AS ENUM ('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'BUSINESS_USER', 'ADMIN', 'SUPER_ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "IdentificationType" AS ENUM ('CAC', 'TIN', 'BVN', 'NIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayPicture" TEXT,
    "identificationType" "IdentificationType",
    "idNumber" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "dob" TIMESTAMP(3),
    "userType" "UserType" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "associatedBusinessId" TEXT,
    "businessAddress" TEXT,
    "businessName" TEXT,
    "deviceId" TEXT,
    "firstName" TEXT,
    "invitedByUserId" TEXT,
    "isBusinessAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "lastName" TEXT,
    "position" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "businessEmail" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IscePermissions" (
    "id" TEXT NOT NULL,
    "connect" BOOLEAN NOT NULL DEFAULT false,
    "connect_plus" BOOLEAN NOT NULL DEFAULT false,
    "store" BOOLEAN NOT NULL DEFAULT false,
    "wallet" BOOLEAN NOT NULL DEFAULT false,
    "event" BOOLEAN NOT NULL DEFAULT false,
    "access" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "IscePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPermissions" (
    "id" TEXT NOT NULL,
    "invoicing" BOOLEAN NOT NULL DEFAULT false,
    "appointment" BOOLEAN NOT NULL DEFAULT false,
    "chat" BOOLEAN NOT NULL DEFAULT false,
    "analytics" BOOLEAN NOT NULL DEFAULT false,
    "services" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BusinessPermissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerify" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verifyCode" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userType" "UserType",

    CONSTRAINT "EmailVerify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resetCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "nfcUid" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "addressText" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_idNumber_key" ON "User"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "IscePermissions_userId_key" ON "IscePermissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPermissions_userId_key" ON "BusinessPermissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerify_email_key" ON "EmailVerify"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_userId_key" ON "PasswordReset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_nfcUid_key" ON "Device"("nfcUid");

-- AddForeignKey
ALTER TABLE "IscePermissions" ADD CONSTRAINT "IscePermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPermissions" ADD CONSTRAINT "BusinessPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
