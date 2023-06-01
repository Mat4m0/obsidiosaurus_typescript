import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { readConfiguration } from './configParser';
import {
    checkI18nGrouping,
    checkLanguage,
    convertWhitespaces,
    writeLogFile,
    removeNumberPrefix,
    removeWhitespacePrefix,
    buildRelDstPath
} from './fileUtils';

/**
 * Processes markdown files in a given folder.
 *
 * This function checks if internationalization is supported and handles file
 * names and paths accordingly. It then builds the destination path for each
 * file and converts the file.
 */
export async function processMarkdown(searchFolder: string, contentType: string, contentName: string): Promise<void> {
    const { SRC_DIR, DST_DIR, LOG_FILE_PATH, SUPPORTED_ADMONITION_TYPES, IMAGE_DETAILS, DST_ASSET_SUBFOLDER, CONVERT_IMAGE_TYPE, LANGUAGE_SEPARATOR, I18N_SUPPORTED } = readConfiguration();

    // Recursive directory walking using Promises
    const walk = async (dir: string): Promise<string[]> => {
        let files = await promisify(fs.readdir)(dir);
        files = await Promise.all(files.map(async (file) => {
            const filePath = path.join(dir, file);
            const stats = await promisify(fs.stat)(filePath);
            if (stats.isDirectory()) return walk(filePath);
            else if(stats.isFile()) return filePath;
        }));
        return files.reduce((all, folderContents) => all.concat(folderContents), []);
    };

    const markdownFiles = (await walk(searchFolder)).filter(f => f.endsWith('.md') && !f.endsWith('excalidraw.md'));

    for (const absSrcFilePath of markdownFiles) {
        const relPath = path.relative(SRC_DIR, absSrcFilePath).replace(/\\/g, '/');
        const splittedPath = relPath.split('/').slice(1);

        let sidebar = '';
        if (contentType === 'docs_base') {
            sidebar = splittedPath[0];
        }
        const pathDepth = splittedPath.length;

        const fullFileName = splittedPath[pathDepth - 1];
        const fileName = fullFileName.split('.')[0];

        if (I18N_SUPPORTED && pathDepth > 1) {
            const grouped = checkI18nGrouping(splittedPath[pathDepth - 2], fileName);
            if (grouped) {
                splittedPath.pop();
                splittedPath[splittedPath.length - 1] += '.md';
            }
        }
        const [language, secondaryLanguage] = checkLanguage(fileName);
        const newFileName = splittedPath[splittedPath.length - 1];

        for (let i = 0; i < splittedPath.length; i++) {
            splittedPath[i] = convertWhitespaces(splittedPath[i]);
        }
        const path = splittedPath.join('/');
        const relDstFilePath = buildRelDstPath(path, language, secondaryLanguage, contentType, contentName);
        const absDstFilePath = path.join(DST_DIR, relDstFilePath.slice(1));

        fs.mkdirSync(path.dirname(absDstFilePath), { recursive: true });
        await convertFile(absSrcFilePath, absDstFilePath, contentType);
        writeLogFile(newFileName, relDstFilePath, DST_DIR, LOG_FILE_PATH);
    }
}

// This is a placeholder for the convertFile function. 
// You will need to implement this function based on the Python code provided.
export async function convertFile(inputFile: string, outputFile: string, contentType: string): Promise<void> {
    const { CONTENT_TYPE } = readConfiguration();

    // Read the input file
    const fileContent = await promisify(fs.readFile)(inputFile, 'utf8');
    const lines = fileContent.split('\n');

    // Process each line in the file
    let inAdmonition = false;
    let inQuote = false;
    let sidebarChecked = false;
    let outputLines = [];

    for (let line of lines) {
        if (contentType === 'docs_base' && !sidebarChecked) {
            [line, sidebarChecked] = writeSidebarFrontmatter(line);
        }
        [line, inAdmonition, inQuote] = convertAdmonition(line, inAdmonition, inQuote);
        // line = convertUrls(line); // Uncomment this line if you implement a 'convertUrls' function
        line = convertAssets(line);
        line = convertLinks(line);
        line = convertExcalidraw(line);
        line = convertSvg(line);
        outputLines.push(line);
    }

    // Write the output file
    await promisify(fs.writeFile)(outputFile, outputLines.join('\n'));

    