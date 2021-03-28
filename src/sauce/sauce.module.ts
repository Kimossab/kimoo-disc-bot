import {
  createInteractionResponse,
  editOriginalInteractionResponse,
} from '../discord/rest';
import { interaction_response_type } from '../helper/constants';
import Logger from '../helper/logger';
import {
  getApplication,
  getChannelLastAttchment,
  setCommandExecutedCallback,
} from '../state/actions';
import messageList from '../helper/messages';
import handleTraceMoe from './trace-moe';
import handleSauceNao from './sauce-nao';
import { getOptionValue } from '../helper/modules.helper';

const _logger = new Logger('sauce');
let firstSetup = true;

const commandExecuted = async (data: discord.interaction): Promise<void> => {
  const app = getApplication();
  if (app) {
    if (data.data && data.data.name === 'sauce') {
      await createInteractionResponse(data.id, data.token, {
        type: interaction_response_type.acknowledge_with_source,
      });

      const type = getOptionValue<string>(data.data.options, 'type');
      const image = getOptionValue<string>(data.data.options, 'image');
      const lastAttachment = getChannelLastAttchment(data.channel_id);

      if (!image && !lastAttachment) {
        await editOriginalInteractionResponse(app.id, data.token, {
          content: messageList.sauce.image_not_found,
        });
        return;
      }

      let url = image ?? lastAttachment;

      if (type === 'anime') {
        //anime
        handleTraceMoe(data, url);
      } else {
        handleSauceNao(data, url);
      }
    }
  }
};

export const setUp = (): void => {
  if (firstSetup) {
    setCommandExecutedCallback(commandExecuted);
    firstSetup = false;
  }
};
