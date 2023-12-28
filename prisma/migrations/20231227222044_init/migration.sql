-- CreateTable
CREATE TABLE "Scripts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ran" TIMESTAMP(3),
    "meta" JSONB NOT NULL,

    CONSTRAINT "Scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "adminRole" TEXT,
    "animeChannel" TEXT,
    "birthdayChannel" TEXT,
    "lastBirthdayWishes" INTEGER,
    "birthdayRole" TEXT,
    "roleChannel" TEXT,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnilistSubscription" (
    "id" TEXT NOT NULL,
    "animeId" INTEGER NOT NULL,
    "user" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,

    CONSTRAINT "AnilistSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LastAiredNotification" (
    "animeId" INTEGER NOT NULL,
    "lastAired" BIGINT,
    "lastUpdated" TIMESTAMP(3),

    CONSTRAINT "LastAiredNotification_pkey" PRIMARY KEY ("animeId")
);

-- CreateTable
CREATE TABLE "BirthdayWithRole" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "serverId" TEXT NOT NULL,

    CONSTRAINT "BirthdayWithRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirthdayWithRoleUser" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "birthdayWithRoleId" TEXT NOT NULL,

    CONSTRAINT "BirthdayWithRoleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Birthday" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER,
    "user" TEXT NOT NULL,
    "lastWishes" INTEGER,
    "serverId" TEXT NOT NULL,

    CONSTRAINT "Birthday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleCategory" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "RoleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "icon" TEXT,
    "roleCategoryId" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "multipleChoice" BOOLEAN NOT NULL,
    "usersCanAddAnswers" BOOLEAN NOT NULL,
    "days" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollOptionVotes" (
    "user" TEXT NOT NULL,
    "pollOptionId" TEXT NOT NULL,

    CONSTRAINT "PollOptionVotes_pkey" PRIMARY KEY ("user","pollOptionId")
);

-- CreateTable
CREATE TABLE "Giveaway" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "prize" TEXT NOT NULL,

    CONSTRAINT "Giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiveawayParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canWin" BOOLEAN NOT NULL DEFAULT true,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "giveawayId" TEXT NOT NULL,

    CONSTRAINT "GiveawayParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Server_id_key" ON "Server"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LastAiredNotification_animeId_key" ON "LastAiredNotification"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "Giveaway_hash_key" ON "Giveaway"("hash");

-- AddForeignKey
ALTER TABLE "AnilistSubscription" ADD CONSTRAINT "AnilistSubscription_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayWithRole" ADD CONSTRAINT "BirthdayWithRole_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayWithRoleUser" ADD CONSTRAINT "BirthdayWithRoleUser_birthdayWithRoleId_fkey" FOREIGN KEY ("birthdayWithRoleId") REFERENCES "BirthdayWithRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Birthday" ADD CONSTRAINT "Birthday_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCategory" ADD CONSTRAINT "RoleCategory_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_roleCategoryId_fkey" FOREIGN KEY ("roleCategoryId") REFERENCES "RoleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollOptionVotes" ADD CONSTRAINT "PollOptionVotes_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "PollOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Giveaway" ADD CONSTRAINT "Giveaway_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiveawayParticipant" ADD CONSTRAINT "GiveawayParticipant_giveawayId_fkey" FOREIGN KEY ("giveawayId") REFERENCES "Giveaway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
