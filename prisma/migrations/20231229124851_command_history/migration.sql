-- CreateTable
CREATE TABLE "CommandHistory" (
    "id" TEXT NOT NULL,
    "serverId" TEXT,
    "channelId" TEXT,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "isComponent" BOOLEAN NOT NULL,

    CONSTRAINT "CommandHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommandHistory" ADD CONSTRAINT "CommandHistory_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE SET NULL ON UPDATE CASCADE;
