"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var fs = require("fs");
var path = require("path");
var pino_1 = require("pino");
exports.logger = (0, pino_1.default)();
var docusaurusFolder = "website";
var settings = {
    mainLanguage: "en",
};
function getMainfolders(folderPath) {
    var subfolders = [];
    var absoluteFolderPath = path.resolve(folderPath);
    try {
        var files = fs.readdirSync(absoluteFolderPath);
        files.forEach(function (file) {
            var filePath = path.join(absoluteFolderPath, file);
            var stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                var type = void 0;
                if (file === '.obsidian') {
                    type = 'ignore';
                }
                else if (file.endsWith('__blog')) {
                    type = 'blog';
                }
                else {
                    type = file;
                }
                if (type !== 'ignore') {
                    var folderObject = {};
                    folderObject[file] = { type: type };
                    subfolders.push(folderObject);
                }
            }
        });
    }
    catch (err) {
        exports.logger.error("Error reading the folder ".concat(absoluteFolderPath, ": ").concat(err.message));
    }
    return subfolders;
}
var folderPath = 'test_vault';
var mainFolders = getMainfolders(folderPath);
exports.logger.info("Subfolders: ".concat(mainFolders));
// Write subfolders to a JSON file
var jsonOutput = JSON.stringify(mainFolders, null, 2);
var outputPath = 'output.json';
try {
    fs.writeFileSync(outputPath, jsonOutput);
    console.log('JSON file written successfully!');
}
catch (err) {
    console.error('Error writing JSON file:', err);
}
function getFileInfo(filePath) {
    var stats = fs.statSync(filePath);
    var fileName = path.basename(filePath);
    var _a = sanitizeFileName(fileName), fileNameClean = _a.fileNameClean, fileExtension = _a.fileExtension, language = _a.language;
    var fileInfo = {
        fileName: fileName,
        fileNameClean: fileNameClean,
        fileExtension: fileExtension,
        language: language,
        mainFolder: path.basename(path.dirname(filePath)),
        parentFolder: path.basename(path.dirname(path.dirname(filePath))),
        pathSource: path.resolve(filePath),
        dateModified: stats.mtime,
        size: stats.size
        // `type`, `pathTarget`, and `language` cannot be inferred from a file path or file metadata
    };
    return fileInfo;
}
// Usage
var filePath = 'G:/obsidiosaurus_typescript/test_vault/blog/2022-01-24-Post1/2022-01-24-Post1__de.md';
console.log(getFileInfo(filePath));
var filePath2 = "G:/obsidiosaurus_typescript/test_vault/assets/excalidraw showcase v1.excalidraw.light.svg";
console.log(getFileInfo(filePath2));
var filePath3 = "G:/obsidiosaurus_typescript/test_vault/docs/sidebar2/1. Topic Y/1. Note Y1.md";
console.log(getFileInfo(filePath3));
function sanitizeFileName(fileName) {
    var parsedPath = path.parse(fileName);
    var fileNameWithoutExtension = parsedPath.name;
    var fileExtension = parsedPath.ext;
    var prefixMatch = fileNameWithoutExtension.match(/^(\d+[\.)])/);
    var fileNameClean;
    if (prefixMatch) {
        console.log("test");
        var baseName = fileNameWithoutExtension.replace(prefixMatch[0], '');
        fileNameClean = baseName;
    }
    else {
        fileNameClean = fileNameWithoutExtension.split('.')[0];
    }
    var languageMatch = fileNameClean.match(/__([a-z]{2})$/i); // match any two-letter code after "__"
    var language = languageMatch ? languageMatch[1] : settings.mainLanguage;
    return { fileNameClean: fileNameClean.trim(), fileExtension: fileExtension, language: language };
}
