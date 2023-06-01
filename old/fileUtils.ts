import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { logger } from './main';
import { readConfiguration } from './configParser';

/**
 * Append a log entry to the log file.
 *
 * @param fileName - Name of the file being processed.
 * @param finalRelPath - The final relative path of the file.
 * @param DST_DIR - The destination directory.
 * @param LOG_FILE - The log file path.
 */
export function writeLogFile(fileName: string, finalRelPath: string, DST_DIR: string, LOG_FILE: string): void {
    if (!existsSync(LOG_FILE)) {
        writeFileSync(LOG_FILE, '', { encoding: 'utf-8' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    appendFileSync(LOG_FILE, `${now},${fileName},${finalRelPath}\n`, { encoding: 'utf-8' });
}

/**
 * Remove a numerical prefix from a string.
 *
 * @param str - The string to process.
 * @returns The string without the numerical prefix.
 */
export function removeNumberPrefix(str: string): string {
    return str.replace(/^\d+[\.\-\)\s]*\s*/, '').trim();
}

/**
 * Remove a whitespace prefix from a string.
 *
 * @param str - The string to process.
 * @returns The string without the whitespace prefix.
 */
export function removeWhitespacePrefix(str: string): string {
    return str.startsWith("%20") ? str.substring(3) : str;
}

/**
 * Convert whitespaces in a string to dashes.
 *
 * @param str - The string to process.
 * @returns The string with whitespaces converted to dashes.
 */
export function convertWhitespaces(str: string): string {
    return str.replace(/%20/g, '-').replace(/ /g, '-');
}


/**
 * Checks if the file name and the last directory name match for internationalization grouping.
 * This function takes two arguments, the last directory name and the file name, and checks if
 * they match for grouping in internationalization.
 * If the file name and last directory name match, the function returns True.
 * Example: X/sidebar1/note/note__en.md -> X/sidebar1/note.md
 *
 * @param lastDir - Last directory name.
 * @param fileName - File name.
 * @returns `true` if file name and last directory name match for grouping, `false` otherwise.
 */
export function checkI18nGrouping(lastDir: string, fileName: string): boolean {
    fileName = removeNumberPrefix(fileName);
    lastDir = removeNumberPrefix(lastDir);
    return fileName.split("__")[0].toLowerCase() === lastDir.toLowerCase();
}

/**
 * Checks if the file name is in the format <file_name><LANGUAGE_SEPERATOR><language_code>.
 * Example: note__en.md, note__de.md
 * If yes, returns the language code and a boolean indicating if the language is a secondary language.
 * If not, returns the main language and `false`.
 *
 * @param name - Name of the file.
 * @returns A tuple where first element is the language code and second element is a boolean indicating if it's a secondary language.
 */
export function checkLanguage(name: string): [string, boolean] {
    const { LANGUAGE_SEPARATOR, MAIN_LANGUAGE, SECONDARY_LANGUAGES } = readConfiguration();
    const nameSplit = name.split(LANGUAGE_SEPARATOR);

    if (nameSplit.length > 1) {
        const language = nameSplit[1];
        return [language, SECONDARY_LANGUAGES.includes(language)];
    }

    return [MAIN_LANGUAGE, false];
}

/**
 * Removes whitespaces from a string.
 *
 * @param str - The string to process.
 * @returns The string without whitespaces.
 */
export function removesWhitespaces(str: string): string {
    return str.replace(/\s/g, '');
}

/**
 * Replaces whitespaces in a string with underscores.
 *
 * @param str - The string to process.
 * @returns The string with whitespaces replaced by underscores.
 */
export function replaceWhitespaces(str: string): string {
    return str.replace(/\s/g, '_');
}

/**
 * Construct a relative file path for various content types in Docusaurus.
 * The content type can be one of the following:
 * - Base Docs: `docs_base`
 * - Base Blog: `blog_base`
 * - Multi Instance Blog: `blog_multi`
 *
 * @param path - Relative path of the file.
 * @param language - Language code.
 * @param secondaryLanguage - Boolean indicating if it's a secondary language.
 * @param CONTENT_TYPE - Type of the content.
 * @param CONTENT_NAME - Name of the content.
 * @returns Relative file path for Docusaurus.
 */
export function buildRelDstPath(
    path: string,
    language: string,
    secondaryLanguage: boolean,
    CONTENT_TYPE: string,
    CONTENT_NAME: string
): string | null {
    const { DST_ASSET_SUBFOLDER } = readConfiguration();
    let relPath: string;

    switch (CONTENT_TYPE) {
        case 'docs_base':
            relPath = secondaryLanguage
                ? `/i18n/${language}/docusaurus-plugin-content-docs/current/${path}`
                : `/${CONTENT_NAME}/${path}`;
            break;

        case 'blog_base':
            relPath = secondaryLanguage
                ? `/i18n/${language}/docusaurus-plugin-content-blog/${path}`
                : `/${CONTENT_NAME}/${path}`;
            break;

        case 'blog_multi':
            relPath = secondaryLanguage
                ? `/i18n/${language}/docusaurus-plugin-content-blog-${CONTENT_NAME}/${path}`
                : `/${CONTENT_NAME}/${path}`;
            break;

        case 'asset':
            relPath = `/static/${DST_ASSET_SUBFOLDER}/${path}`;
            break;

        default:
            return null;
    }

    return relPath;
}
