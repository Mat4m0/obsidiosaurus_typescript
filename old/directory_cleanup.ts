import { existsSync, readFileSync, unlinkSync, rmdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { logger } from './main';
import { readConfiguration } from './configParser';

const { LOG_FILE_PATH, DST_DIR } = readConfiguration();

// Prepare the destination directory (DST_DIR) by removing files and directories
// previously logged in the LOG_FILE. It first removes the files listed in the log file, then
// removes the directories (deepest first) containing those files, and finally deletes the log file.

// Note:
//    This function assumes that the LOG_FILE is properly formatted with comma-separated values, where
//    each line contains a file or directory to be removed.

function pathDepth(path: string) {
    return path.split(/\/|\\/).length;
}

function sortPathsByDepth(paths: string[]): string[] {
    return paths.sort((a, b) => pathDepth(b) - pathDepth(a));
}

function prepareDstDir() {

    if (!existsSync(LOG_FILE_PATH)) {
        logger.info(`Log file ${LOG_FILE_PATH} not found, skipping directory cleanup.`);
        return;
    }

    const pathsToRemove = readLogFile(LOG_FILE_PATH, DST_DIR);
    removePaths(pathsToRemove);
    removeLogFile(LOG_FILE_PATH);
}

function readLogFile(logFilePath: string, dstDir: string): string[] {
    const pathsToRemove: string[] = [];

    const logFileContents = readFileSync(logFilePath, 'utf-8');
    const lines = logFileContents.split('\n');

    for (const line of lines) {
        const parts = line.split(',');
        const relPathTemp = parts[2].trim();
        const path = join(dstDir, relPathTemp.substring(1));
        pathsToRemove.push(path);
    }

    return pathsToRemove;
}

function removePaths(paths: string[]) {
    const sortedPaths = sortPathsByDepth(paths);

    for (const path of sortedPaths) {
        try {
            unlinkSync(path);
            logger.info(`Removed file: ${path}`);
        } catch (err) {
            if (err.code === 'EISDIR') {
                try {
                    rmdirSync(path);
                    logger.info(`Removed directory: ${path}`);
                } catch (err) {
                    logger.error(`Error removing directory ${path}: ${err}`);
                }
            } else {
                logger.error(`Error removing file ${path}: ${err}`);
            }
        }
    }
}

function removeLogFile(logFilePath: string) {
    try {
        unlinkSync(logFilePath);
        logger.info(`Removed log file: ${logFilePath}`);
    } catch (err) {
        logger.error(`Error removing log file ${logFilePath}: ${err}`);
    }
}

prepareDstDir();
