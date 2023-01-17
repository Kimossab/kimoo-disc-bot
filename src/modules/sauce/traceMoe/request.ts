import { downloadFile } from "@/helper/common";
import Logger from "@/helper/logger";

import axios, { AxiosResponse } from "axios";
import FormData from "form-data";
import fs from "fs";

export const requestTraceMoe = async (
  image: string,
  logger?: Logger
): Promise<TraceMoe.response | null> => {
  try {
    const result = await downloadFile(image, "trash/trash.png");

    if (result) {
      const data = new FormData();
      const stream = fs.createReadStream("trash/trash.png");
      data.append("image", stream);

      const res = await axios.post<FormData, AxiosResponse<TraceMoe.response>>(
        "https://api.trace.moe/search?anilistInfo",
        data,
        {
          headers: data.getHeaders(),
        }
      );
      return res.data;
    }

    return null;
  } catch (e) {
    logger?.error("Requesting sauce trace moe", JSON.stringify(e));
  }

  return null;
};
