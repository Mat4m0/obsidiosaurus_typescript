import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { parse } from 'ini';
import { logger } from './main';


// This script reads the configuration file (config.ini) and sets various
// configuration variables based on the content of the file.

export function readConfiguration() {
    const configFilePath = join(dirname(resolve(__dirname)), 'config', 'config.ini');

    if (!existsSync(configFilePath)) {
        const errorMessage = `Configuration file not found: ${configFilePath}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }

    const configFileContents = readFileSync(configFilePath, 'utf-8');
    const config = parse(configFileContents);

    try {
        const LOG_FILE_NAME = 'obsidiosaurus.log';
        const SRC_DIR = resolve(config.Directories.obsidian_vault_directory);
        const DST_DIR = resolve(config.Directories.docusaurus_directory);
        const LOG_FILE_PATH = join(DST_DIR, LOG_FILE_NAME);
        
        // Exporting variables
        return {
            LOG_FILE_NAME,
            SRC_DIR,
            DST_DIR,
            LOG_FILE_PATH,
            IGNORED_DIRS: config.Directories.ignored_folders.split(','),
            ASSET_FOLDER_NAME: config.Assets.obsidian_asset_folder_name,
            DST_ASSET_SUBFOLDER: config.Assets.docusaurus_asset_subfolder_name,
            I18N_SUPPORTED: config.Language.i18n_supported.toLowerCase() === 'true',
            LANGUAGE_SEPARATOR: config.Language.language_separator,
            MAIN_LANGUAGE: config.Language.main_language,
            SECONDARY_LANGUAGES: config.Language.secondary_languages.split(','),
            CONVERT_IMAGES: config.Images.convert_images.toLowerCase() === 'true',
            CONVERT_IMAGE_TYPE: config.Images.converted_image_type,
            CONVERT_IMAGE_MAX_WIDTH: parseInt(config.Images.converted_image_max_width, 10),
            IMAGE_DETAILS: [],
            CONTENT_TYPE: '',
            CONTENT_NAME: '',
            SIDEBAR: '',
            ADMONITION_WHITESPACES: 0,
            SUPPORTED_ADMONITION_TYPES: ['note', 'tip', 'info', 'caution', 'danger'],
            EXCALIDRAW: config.Features.excalidraw.toLowerCase() === 'true',
        };
    } catch (err) {
        logger.error(`Error parsing configuration: ${err}`);
        throw err;
    }
}