import * as fs from 'fs';
import * as path from 'path';

import { readConfiguration } from './configParser';
import { processMarkdown } from './markdownProcessor';
import { processAssets } from './old/assetProcesser';

/**
 * Processes the source directory `SRC_DIR` and its subdirectories.
 *
 * The function retrieves the list of subdirectories in `SRC_DIR` and removes
 * the subdirectories that are listed in the global variable `IGNORED_DIRS`.
 * Then, the function checks each subdirectory against several conditions to
 * determine the content type and name. The content type and name are used
 * to call different processing functions.
 */
export async function processSrcDir(): Promise<void> {
    const { SRC_DIR, ASSET_FOLDER_NAME, IGNORED_DIRS } = readConfiguration();

    let contentType: string = "";
    let contentName: string = "";

    // Makes sure that "asset" folder is always last to process
    // Remove from list
    const folderList: string[] = (
        await fs.promises.readdir(SRC_DIR)
    ).filter(
        (d) => !IGNORED_DIRS.includes(d) && d !== ASSET_FOLDER_NAME
    );

    // Add asset folder to end of list
    for (const folder of [...folderList, ASSET_FOLDER_NAME]) {
        const searchFolder = path.join(SRC_DIR, folder);

        if (folder === "docs") {
            contentType = "docs_base";
            contentName = "docs";
        } else if (folder === "blog") {
            contentType = "blog_base";
            contentName = "blog";
        } else if (folder.endsWith("__blog")) {
            contentType = "blog_multi";
            contentName = folder.slice(0, -("__blog".length));
        } else if (folder === ASSET_FOLDER_NAME) {
            contentType = "asset";
            contentName = "assets";
            await processAssets(searchFolder);
            continue;
        }

        await processMarkdown(searchFolder, contentType, contentName);
    }
}
