import shortId from 'shortid';
import * as downloader from 'image-downloader';
import { ImageType, resizeAndStore, tempFilename, tempFileUrl } from './Image';

export async function ImageDownload(
  originalUrl: string,
): Promise<{ thumbnailUrl: string; previewUrl: string }> {
  if (originalUrl === undefined) {
    throw Error('Trying to download image with no url defined');
  }
  console.log(`Download ${originalUrl}`);
  const tempId = shortId.generate();
  const originalFilename = originalUrl.split('/').pop();
  if (originalFilename === undefined) {
    throw Error(`No filename found in image url ${originalUrl}`);
  }
  const tempOriginal = tempFilename(
    tempId,
    ImageType.ORIGINAL,
    originalFilename,
  );
  const tempOriginalPath = tempFileUrl(tempOriginal);
  console.log(`download:tempOriginalPath=${tempOriginalPath}`);
  try {
    const options = {
      url: originalUrl,
      dest: tempOriginalPath.pathname,
      extractFilename: false,
      timeout: 10000,
    };
    console.log(`Downloading file ${originalUrl}`);
    const res = await downloader.image(options);
    console.log(`Downloaded file ${res.filename}`);
  } catch (e) {
    throw Error(`Failed downloading file from ${originalUrl}: ${e}`);
  }
  try {
    const { thumbnailUrl, previewUrl } = await resizeAndStore(
      tempId,
      originalFilename,
      tempOriginalPath,
    );
    return { thumbnailUrl, previewUrl };
  } catch (e) {
    throw Error(`Failed during resizeAndStore: ${e}`);
  }
}
