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

-- CreateIndex
CREATE UNIQUE INDEX "IscePermissions_userId_key" ON "IscePermissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPermissions_userId_key" ON "BusinessPermissions"("userId");

-- AddForeignKey
ALTER TABLE "IscePermissions" ADD CONSTRAINT "IscePermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPermissions" ADD CONSTRAINT "BusinessPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
