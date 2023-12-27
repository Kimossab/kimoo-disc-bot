import Logger from "@/helper/logger";
import mongoConnect from "@/scripts/migrate-mongo-postgres/mongo";
import { PrismaClient } from "@prisma/client";

import AnilistSubscriptionModel from "./AnilistSubscription.model";
import birthdayModel from "./birthday.model";
import birthdayWithRoleModel from "./birthday-with-role.model";
import GiveawayModel from "./Giveaway.model";
import LastAiredNotificationModel from "./LastAiredNotification.model";
import PollModel from "./Poll.model";
import RoleCategoryModel from "./RoleCategory.model";
import serverSettingsModel from "./server-settings.model";
import mongoose from "mongoose";

export const SCRIPT_NAME = "migrate-mongo-postgres";

export const run = async () => {
  const prisma = new PrismaClient();

  let script = await prisma.scripts.findFirst({ where: { name: SCRIPT_NAME } });

  if (!script) {
    script = await prisma.scripts.create({
      data: {
        name: SCRIPT_NAME,
        ran: null,
        meta: {
          progress: 0,
          total: 6,
        },
      },
    });
  }

  if (script.ran) {
    return;
  }

  const logger = new Logger(SCRIPT_NAME);
  logger.info("Script init...");

  await mongoConnect(process.env.MONGO_DATABASE_URL);

  // SERVER SETTINGS
  if ((script.meta as { progress: number }).progress < 1) {
    await prisma.$transaction(async (tx) => {
      const serverSettings = await serverSettingsModel.find();

      const serverMany = serverSettings.map((settings) => ({
        id: settings.serverId,
        adminRole: settings.adminRole,
        animeChannel: settings.animeChannel,
        birthdayChannel: settings.birthdayChannel,
        lastBirthdayWishes: settings.lastBirthdayWishes,
        birthdayRole: settings.birthdayRole,
        roleChannel: settings.roleChannel,
      }));

      await tx.server.createMany({
        data: serverMany,
      });
      await tx.scripts.update({
        where: {
          id: script?.id,
        },
        data: {
          meta: {
            progress: 1,
            total: 6,
          },
        },
      });
    });
    logger.info("Server settings migrated.");
  }

  // ANILIST
  if ((script.meta as { progress: number }).progress < 2) {
    await prisma.$transaction(async (tx) => {
      const subscriptions = await AnilistSubscriptionModel.find();
      const subscriptionMany = subscriptions.map((sub) => ({
        animeId: sub.id,
        user: sub.user,
        serverId: sub.server,
      }));
      await tx.anilistSubscription.createMany({
        data: subscriptionMany,
      });

      const lastAired = await LastAiredNotificationModel.find();
      const lastAiredMany = lastAired.map((sub) => ({
        animeId: sub.id,
        lastAired: sub.lastAired,
        lastUpdated: sub.lastUpdated,
      }));
      await tx.lastAiredNotification.createMany({
        data: lastAiredMany,
      });
      await tx.scripts.update({
        where: {
          id: script?.id,
        },
        data: {
          meta: {
            progress: 2,
            total: 6,
          },
        },
      });
    });
    logger.info("Anilist migrated.");
  }

  // BIRTHDAYS
  if ((script.meta as { progress: number }).progress < 3) {
    await prisma.$transaction(async (tx) => {
      const birthdaysWithRoles = await birthdayWithRoleModel.find();

      for (const birthday of birthdaysWithRoles) {
        await tx.birthdayWithRole.create({
          data: {
            day: birthday.day,
            month: birthday.month,
            serverId: birthday.server,
            birthdayWithRoleUsers: {
              create: birthday.users.map((user) => ({
                user: user,
              })),
            },
          },
        });
      }
      const birthdays = await birthdayModel.find();
      const birthdaysMany = birthdays.map((birthday) => ({
        day: birthday.day,
        month: birthday.month,
        year: birthday.month,
        user: birthday.user,
        serverId: birthday.server,
        lastWishes: birthday.lastWishes,
      }));
      await tx.birthday.createMany({
        data: birthdaysMany,
      });
      await tx.scripts.update({
        where: {
          id: script?.id,
        },
        data: {
          meta: {
            progress: 3,
            total: 6,
          },
        },
      });
    });
    logger.info("Birthdays migrated.");
  }

  // ROLES
  if ((script.meta as { progress: number }).progress < 4) {
    await prisma.$transaction(async (tx) => {
      const roles = await RoleCategoryModel.find();

      for (const role of roles) {
        await tx.roleCategory.create({
          data: {
            serverId: role.server,
            message: role.message,
            category: role.category,
            roles: {
              create: role.roles.map((role) => ({
                id: role.role,
                icon: role.icon,
              })),
            },
          },
        });
      }

      await tx.scripts.update({
        where: {
          id: script?.id,
        },
        data: {
          meta: {
            progress: 4,
            total: 6,
          },
        },
      });
    });

    logger.info("Roles migrated.");
  }

  // POLLS
  if ((script.meta as { progress: number }).progress < 5) {
    await prisma.$transaction(async (tx) => {
      // POLLS
      const polls = await PollModel.find();
      for (const poll of polls) {
        await tx.poll.create({
          data: {
            hash: poll.hash,
            creator: poll.creator,
            question: poll.question,
            multipleChoice: poll.multipleChoice,
            usersCanAddAnswers: poll.usersCanAddAnswers ?? false,
            days: poll.days,
            startAt: poll.startAt,
            pollOptions: {
              create: poll.options.map((option) => ({
                text: option.text,
                pollOptionVotes: {
                  create: option.votes.map((vote) => ({
                    user: vote,
                  })),
                },
              })),
            },
          },
        });
      }
      await tx.scripts.update({
        where: {
          id: script?.id,
        },
        data: {
          meta: {
            progress: 5,
            total: 6,
          },
        },
      });
    });
    logger.info("Polls migrated.");
  }

  // GIVEAWAYS
  if ((script.meta as { progress: number }).progress < 6) {
    await prisma.$transaction(async (tx) => {
      const giveaways = await GiveawayModel.find();
      for (const giveaway of giveaways) {
        await tx.giveaway.create({
          data: {
            serverId: giveaway.serverId,
            hash: giveaway.hash,
            channelId: giveaway.channelId,
            creatorId: giveaway.creatorId,
            endAt: giveaway.endAt,
            prize: giveaway.prize,
            participants: {
              create: giveaway.participants.map((participant) => ({
                userId: participant,
                canWin: true,
                isWinner: giveaway.winner == participant,
              })),
            },
          },
        });
      }
      await tx.scripts.update({
        where: {
          id: script?.id,
        },
        data: {
          meta: {
            progress: 6,
            total: 6,
          },
        },
      });
    });
    logger.info("Giveaways migrated.");
  }

  // END
  await mongoose.disconnect();
  await prisma.scripts.update({
    where: { id: script.id },
    data: {
      ran: new Date(),
    },
  });
  logger.info("Script end.");
};
