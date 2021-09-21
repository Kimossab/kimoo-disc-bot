import request from 'request';
import fs from 'fs';

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB

const IMAGE_EXTENSIONS: { [index: string]: string } = {
  'image/apng': '.apng',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};

type DownloadImageResponse = {
  success: false;
} | {
  success: true;
  extension: string;
}

export const downloadImage = async (
  url: string,
  dest: string
): Promise<DownloadImageResponse> => {
  return new Promise((resolve) => {
    request(
      {
        url: url,
        method: 'HEAD',
      },
      (err, { headers }) => {
        const contentType = headers['content-type'];
        if (
          err ||
          !contentType ||
          !Object.keys(IMAGE_EXTENSIONS).includes(contentType) ||
          !headers['content-length'] ||
          Number(headers['content-length']) > MAX_IMAGE_SIZE
        ) {
          resolve({ success: false });
          return;
        }

        const file = fs.createWriteStream(dest);
        let size = 0;

        const res = request({ url });

        res.on('data', function (data) {
          size += data.length;

          if (size > MAX_IMAGE_SIZE) {
            resolve({ success: false });

            res.abort();
            fs.unlink(dest, () => {
              resolve({ success: false });
            });
          }
        })
          .on('error', function (err) {
            fs.unlink(dest, () => {
              resolve({ success: false });
            });
          }).pipe(file);

        file.on('finish', () => {
          file.close();
          resolve({ success: true, extension: IMAGE_EXTENSIONS[(contentType as string)] });
        });
      }
    );
  });
};
