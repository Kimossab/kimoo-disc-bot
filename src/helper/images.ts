import axios from "axios";
import fs from "fs";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB

const IMAGE_EXTENSIONS: { [index: string]: string } = {
  "image/apng": ".apng",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

type DownloadImageResponse =
  | {
      success: false;
    }
  | {
      success: true;
      extension: string;
    };

export const downloadImage = async (
  url: string,
  dest: string
): Promise<DownloadImageResponse> => {
  try {
    const { headers } = await axios.head(url);

    const contentType = headers["content-type"];

    if (
      !contentType ||
      !Object.keys(IMAGE_EXTENSIONS).includes(
        contentType
      ) ||
      !headers["content-length"] ||
      Number(headers["content-length"]) > MAX_IMAGE_SIZE
    ) {
      return { success: false };
    }

    const file = fs.createWriteStream(dest);

    const response = await axios.get<fs.WriteStream>(url, {
      responseType: "stream",
      maxBodyLength: MAX_IMAGE_SIZE,
    });

    response.data.pipe(file);

    return new Promise((resolve) => {
      file.on("finish", () =>
        resolve({
          success: true,
          extension:
            IMAGE_EXTENSIONS[contentType as string],
        })
      );
      file.on("error", () => resolve({ success: false }));
    });
  } catch (e) {
    return { success: false };
  }
};
