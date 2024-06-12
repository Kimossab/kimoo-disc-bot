import { CompleteGiveaway, getGiveaway, setWinner } from "#giveaway/database";

import { editMessage, sendMessage } from "@/discord/rest";
import { randomNum } from "@/helper/common";
import { ILogger } from "@/helper/logger";

import { createGiveawayMessageData } from "./createGiveawayMessage";

export class GiveawayManager {
  private timer: NodeJS.Timeout | undefined;

  private giveawayHash: string;

  public get id (): string {
    return this.giveawayHash;
  }

  constructor (
    private logger: ILogger,
    giveaway: CompleteGiveaway,
    private onFinish: (id: string) => void
  ) {
    this.giveawayHash = giveaway.hash;

    const time = +giveaway.endAt - +new Date();
    logger.info(`created timer with ${time}ms`, { giveaway });
    this.timer = setTimeout(async () => {
      await this.finish();
    }, time);
  }

  private async finish () {
    let giveaway = await getGiveaway(this.giveawayHash);
    this.logger.info("Giveaway has ended", { giveaway });

    const winnerIdx = randomNum(0, giveaway!.participants.length - 1);
    const winner = giveaway!.participants[winnerIdx];
    await setWinner(winner.id);

    giveaway = await getGiveaway(this.giveawayHash);
    await announceVictor(giveaway!);

    this.onFinish(this.giveawayHash);
  }

  public close () {
    this.timer && clearTimeout(this.timer);
  }
}

export const announceVictor = async (giveaway: CompleteGiveaway) => {
  const winner = giveaway.participants.find((p) => p.isWinner)?.userId;
  await sendMessage(
    giveaway.channelId,
    winner
      ? `Congratulations <@${winner}> you won \`${giveaway.prize}\` given by <@${giveaway.creatorId}>`
      : "There's no participants to win.",
    undefined,
    {
      message_id: giveaway.hash
    }
  );

  await editMessage(giveaway.channelId, giveaway.hash, {
    ...createGiveawayMessageData(giveaway),
    attachments: undefined
  });
};
