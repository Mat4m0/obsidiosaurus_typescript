"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const main_1 = require("./main");
const configParser_1 = require("./configParser");
const { LOG_FILE_PATH, DST_DIR } = (0, configParser_1.readConfiguration)();
// Prepare the destination directory (DST_DIR) by removing files and directories
// previously logged in the LOG_FILE. It first removes the files listed in the log file, then
// removes the directories (deepest first) containing those files, and finally deletes the log file.
// Note:
//    This function assumes that the LOG_FILE is properly formatted with comma-separated values, where
//    each line contains a file or directory to be removed.
function pathDepth(path) {
    return path.split(/\/|\\/).length;
}
function sortPathsByDepth(paths) {
    return paths.sort((a, b) => pathDepth(b) - pathDepth(a));
}
function prepareDstDir() {
    if (!(0, fs_1.existsSync)(LOG_FILE_PATH)) {
        main_1.logger.info(`Log file ${LOG_FILE_PATH} not found, skipping directory cleanup.`);
        return;
    }
    const pathsToRemove = readLogFile(LOG_FILE_PATH, DST_DIR);
    removePaths(pathsToRemove);
    removeLogFile(LOG_FILE_PATH);
}
function readLogFile(logFilePath, dstDir) {
    const pathsToRemove = [];
    const logFileContents = (0, fs_1.readFileSync)(logFilePath, 'utf-8');
    const lines = logFileContents.split('\n');
    for (const line of lines) {
        const parts = line.split(',');
        const relPathTemp = parts[2].trim();
        const path = (0, path_1.join)(dstDir, relPathTemp.substring(1));
        pathsToRemove.push(path);
    }
    return pathsToRemove;
}
function removePaths(paths) {
    const sortedPaths = sortPathsByDepth(paths);
    for (const path of sortedPaths) {
        try {
            (0, fs_1.unlinkSync)(path);
            main_1.logger.info(`Removed file: ${path}`);
        }
        catch (err) {
            if (err.code === 'EISDIR') {
                try {
                    (0, fs_1.rmdirSync)(path);
                    main_1.logger.info(`Removed directory: ${path}`);
                }
                catch (err) {
                    main_1.logger.error(`Error removing directory ${path}: ${err}`);
                }
            }
            else {
                main_1.logger.error(`Error removing file ${path}: ${err}`);
            }
        }
    }
}
function removeLogFile(logFilePath) {
    try {
        (0, fs_1.unlinkSync)(logFilePath);
        main_1.logger.info(`Removed log file: ${logFilePath}`);
    }
    catch (err) {
        main_1.logger.error(`Error removing log file ${logFilePath}: ${err}`);
    }
}
prepareDstDir();
