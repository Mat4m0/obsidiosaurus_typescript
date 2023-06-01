import { promises as fs } from 'fs';
import { join } from 'path';
import { convertAndResizeImage } from './imageUtils';
import { convertWhitespaces } from './fileUtils';
import { readConfiguration } from './configParser';
import { logger } from './main';

const { DST_ASSET_SUBFOLDER, DST_DIR } = readConfiguration();

async function convertExcalidraw(line: string): Promise<string> {
    if (line.includes(".excalidraw]]")) {
        const match = line.match(/(.+\/)(.+)(\.excalidraw)/);
        if (match) {
            const fileName = match[2].replace(' ', '-');
            line = `![](/${DST_ASSET_SUBFOLDER}/${fileName}.excalidraw.dark.svg#dark)\n![](/assets/${fileName}.excalidraw.light.svg#light)\n`;
        }
    }
    return line;
}

async function convertSvg(line: string): Promise<string> {
    if (line.includes(".svg]]")) {
        const match = line.match(/(.+\/)(.+)(\.svg)/);
        if (match) {
            const fileName = match[2].replace(' ', '-');
            line = `![](/${DST_ASSET_SUBFOLDER}/${fileName}.svg)\n`;
        }
    }
    return line;
}

export async function processAssets(searchFolder: string): Promise<void> {
    try {
        const files = await fs.readdir(searchFolder);
        const dstDirPath = join(DST_DIR, 'static', DST_ASSET_SUBFOLDER);

        for (const file of files) {
            const fileName = convertWhitespaces(file);
            const dstFilePath = join(dstDirPath, fileName);

            if (file.endsWith(".jpg") || file.endsWith(".png")) {
                await convertAndResizeImage(file, searchFolder);
            } else if (!file.endsWith(".excalidraw.md")) {
                await fs.copyFile(join(searchFolder, file), dstFilePath);
            }
        }
    } catch (error) {
        logger.error(`Error processing assets: ${error}`);
    }
}
