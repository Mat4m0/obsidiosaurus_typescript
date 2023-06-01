"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRelDstPath = exports.replaceWhitespaces = exports.removesWhitespaces = exports.checkLanguage = exports.checkI18nGrouping = exports.convertWhitespaces = exports.removeWhitespacePrefix = exports.removeNumberPrefix = exports.writeLogFile = void 0;
const fs_1 = require("fs");
const configParser_1 = require("./configParser");
/**
 * Append a log entry to the log file.
 *
 * @param fileName - Name of the file being processed.
 * @param finalRelPath - The final relative path of the file.
 * @param DST_DIR - The destination directory.
 * @param LOG_FILE - The log file path.
 */
function writeLogFile(fileName, finalRelPath, DST_DIR, LOG_FILE) {
    if (!(0, fs_1.existsSync)(LOG_FILE)) {
        (0, fs_1.writeFileSync)(LOG_FILE, '', { encoding: 'utf-8' });
    }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    (0, fs_1.appendFileSync)(LOG_FILE, `${now},${fileName},${finalRelPath}\n`, { encoding: 'utf-8' });
}
exports.writeLogFile = writeLogFile;
/**
 * Remove a numerical prefix from a string.
 *
 * @param str - The string to process.
 * @returns The string without the numerical prefix.
 */
function removeNumberPrefix(str) {
    return str.replace(/^\d+[\.\-\)\s]*\s*/, '').trim();
}
exports.removeNumberPrefix = removeNumberPrefix;
/**
 * Remove a whitespace prefix from a string.
 *
 * @param str - The string to process.
 * @returns The string without the whitespace prefix.
 */
function removeWhitespacePrefix(str) {
    return str.startsWith("%20") ? str.substring(3) : str;
}
exports.removeWhitespacePrefix = removeWhitespacePrefix;
/**
 * Convert whitespaces in a string to dashes.
 *
 * @param str - The string to process.
 * @returns The string with whitespaces converted to dashes.
 */
function convertWhitespaces(str) {
    return str.replace(/%20/g, '-').replace(/ /g, '-');
}
exports.convertWhitespaces = convertWhitespaces;
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
function checkI18nGrouping(lastDir, fileName) {
    fileName = removeNumberPrefix(fileName);
    lastDir = removeNumberPrefix(lastDir);
    return fileName.split("__")[0].toLowerCase() === lastDir.toLowerCase();
}
exports.checkI18nGrouping = checkI18nGrouping;
/**
 * Checks if the file name is in the format <file_name><LANGUAGE_SEPERATOR><language_code>.
 * Example: note__en.md, note__de.md
 * If yes, returns the language code and a boolean indicating if the language is a secondary language.
 * If not, returns the main language and `false`.
 *
 * @param name - Name of the file.
 * @returns A tuple where first element is the language code and second element is a boolean indicating if it's a secondary language.
 */
function checkLanguage(name) {
    const { LANGUAGE_SEPARATOR, MAIN_LANGUAGE, SECONDARY_LANGUAGES } = (0, configParser_1.readConfiguration)();
    const nameSplit = name.split(LANGUAGE_SEPARATOR);
    if (nameSplit.length > 1) {
        const language = nameSplit[1];
        return [language, SECONDARY_LANGUAGES.includes(language)];
    }
    return [MAIN_LANGUAGE, false];
}
exports.checkLanguage = checkLanguage;
/**
 * Removes whitespaces from a string.
 *
 * @param str - The string to process.
 * @returns The string without whitespaces.
 */
function removesWhitespaces(str) {
    return str.replace(/\s/g, '');
}
exports.removesWhitespaces = removesWhitespaces;
/**
 * Replaces whitespaces in a string with underscores.
 *
 * @param str - The string to process.
 * @returns The string with whitespaces replaced by underscores.
 */
function replaceWhitespaces(str) {
    return str.replace(/\s/g, '_');
}
exports.replaceWhitespaces = replaceWhitespaces;
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
function buildRelDstPath(path, language, secondaryLanguage, CONTENT_TYPE, CONTENT_NAME) {
    const { DST_ASSET_SUBFOLDER } = (0, configParser_1.readConfiguration)();
    let relPath;
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
exports.buildRelDstPath = buildRelDstPath;
