import { promises as fs } from 'fs';
import * as path from 'path';
import sharp from 'sharp';

import { readConfiguration } from './configParser';
import { convertWhitespaces } from './fileUtils';

/**
 * Converts and resizes an image.
 *
 * @param image - Name of the image file.
 * @param srcPath - Source path of the image file.
 */
export async function convertAndResizeImage(image: string, srcPath: string): Promise<void> {
    const { IMAGE_DETAILS, CONVERT_IMAGE_MAX_WIDTH, CONVERT_IMAGE_TYPE, DST_DIR, DST_ASSET_SUBFOLDER } = readConfiguration();

    const filePath = path.join(srcPath, image);
    let img = sharp(filePath);

    const imageMetaData = await img.metadata();
    let width: number | undefined;
    let height: number | undefined;

    for (const imageDetail of IMAGE_DETAILS) {
        if (imageDetail.filename === image) {
            width = imageDetail.width !== undefined ? parseInt(imageDetail.width) : undefined;
            height = imageDetail.height !== undefined ? parseInt(imageDetail.height) : undefined;

            if (imageMetaData.width! > CONVERT_IMAGE_MAX_WIDTH && width === undefined) {
                width = CONVERT_IMAGE_MAX_WIDTH;
                height = Math.floor((width * imageMetaData.height!) / imageMetaData.width!);
            } else if (width === undefined && height === undefined) {
                height = imageMetaData.height;
                width = imageMetaData.width;
            } else if (width !== undefined && height === undefined) {
                height = Math.floor((width * imageMetaData.height!) / imageMetaData.width!);
            } else {
                width = Math.floor((height! * imageMetaData.width!) / imageMetaData.height!);
            }

            img = img.resize(width, height);

            const dstDirPath = path.join(DST_DIR, 'static', DST_ASSET_SUBFOLDER);
            const exists = await fs.access(dstDirPath).then(() => true).catch(() => false);
            if (!exists) {
                await fs.mkdir(path.dirname(dstDirPath), { recursive: true });
            }

            const fileName = `${convertWhitespaces(imageDetail.filename_new)}.${CONVERT_IMAGE_TYPE}`;
            const dstFilePath = path.join(dstDirPath, fileName);

            await img.toFile(dstFilePath);
        }
    }
}
