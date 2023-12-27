import { getGiveawayById } from "#giveaway/database";
import { IGiveaway, IGiveawayDocument } from "#giveaway/models/Giveaway.model";

import { editMessage, sendMessage } from "@/discord/rest";
import { randomNum } from "@/helper/common";
import { ILogger } from "@/helper/logger";

import { createGiveawayMessageData } from "./createGiveawayMessage";

export class GiveawayManager {
  private timer: NodeJS.Timeout | undefined;
  private giveawayId: string;

  public get id(): string {
    return this.giveawayId;
  }
  constructor(
    private logger: ILogger,
    giveaway: IGiveawayDocument,
    private onFinish: (id: string) => void
  ) {
    this.giveawayId = giveaway._id;

    const time = +giveaway.endAt - +new Date();
    logger.info(`created timer with ${time}ms`);
    this.timer = setTimeout(() => this.finish(), time);
  }

  private async finish() {
    const giveaway = await getGiveawayById(this.giveawayId);
    this.logger.info("Giveaway has ended", { giveaway });

    const winner = randomNum(0, giveaway!.participants.length - 1);

    giveaway!.winner = giveaway!.participants[winner];

    await giveaway!.save();

    await announceVictor(giveaway!);

    this.onFinish(this.giveawayId);
  }
}

export const announceVictor = async (giveaway: IGiveaway) => {
  await sendMessage(
    giveaway.channelId,
    giveaway.winner
      ? `Congratulations <@${giveaway.winner}> you won \`${giveaway.prize}\` given by <@${giveaway.creatorId}>`
      : `There's no participants to win.`,
    undefined,
    {
      message_id: giveaway.hash,
    }
  );

  await editMessage(giveaway.channelId, giveaway.hash, {
    ...createGiveawayMessageData(giveaway),
    attachments: undefined,
  });
};
