import Logger from "@/helper/logger";

import axios from "axios";

export const requestSauceNao = async (
  image: string,
  logger: Logger,
): Promise<SauceNao.response | null> => {
  try {
    const res = await axios.get<SauceNao.response>(`https://saucenao.com/search.php?output_type=2&api_key=${process.env.SAUCENAO_API_KEY}&testmode=1&url=${image}`);

    return res.data;
  }
  catch (e) {
    logger.error(
      "Requesting sauce nao",
      axios.isAxiosError(e)
        ? e.response
        : JSON.stringify(e),
    );
  }

  return null;
};
