"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pino_1 = __importDefault(require("pino"));
exports.logger = (0, pino_1.default)();
const docusaurusFolder = "website";
function getMainfolders(folderPath) {
    const subfolders = [];
    const absoluteFolderPath = path.resolve(folderPath);
    try {
        const files = fs.readdirSync(absoluteFolderPath);
        files.forEach(file => {
            const filePath = path.join(absoluteFolderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                let type;
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
                    const folderObject = {};
                    folderObject[file] = { type };
                    subfolders.push(folderObject);
                }
            }
        });
    }
    catch (err) {
        exports.logger.error(`Error reading the folder ${absoluteFolderPath}: ${err.message}`);
    }
    return subfolders;
}
const folderPath = 'test_vault';
const mainFolders = getMainfolders(folderPath);
exports.logger.info(`Subfolders: ${mainFolders}`);
// Write subfolders to a JSON file
const jsonOutput = JSON.stringify(mainFolders, null, 2);
const outputPath = 'output.json';
try {
    fs.writeFileSync(outputPath, jsonOutput);
    console.log('JSON file written successfully!');
}
catch (err) {
    console.error('Error writing JSON file:', err);
}
function getFileInfo(filePath) {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const fileNameClean = sanitizeFileName(fileName);
    const fileInfo = {
        fileName,
        fileNameClean,
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
const filePath = 'G:/obsidiosaurus_typescript/test_vault/blog/2022-01-24-Post1/2022-01-24-Post1__de.md';
console.log(getFileInfo(filePath));
const filePath2 = "G:/obsidiosaurus_typescript/test_vault/assets/excalidraw showcase v1.excalidraw.light.svg";
console.log(getFileInfo(filePath2));
const filePath3 = "G:/obsidiosaurus_typescript/test_vault/docs/sidebar2/1. Topic Y/1. Note Y1.md";
console.log(getFileInfo(filePath3));
function sanitizeFileName(fileName) {
    const fileNameWithoutExtension = path.parse(fileName).name; // Remove the extension
    const prefixMatch = fileNameWithoutExtension.match(/^(\d+[\.)])/); // Match numeric prefix (e.g., "1.", "2)")
    let fileNameClean;
    if (prefixMatch) {
        console.log("test");
        // If there's a numeric prefix, keep it and remove everything after "__" if present
        const baseName = fileNameWithoutExtension.replace(prefixMatch[0], '').split('__')[0];
        fileNameClean = baseName;
    }
    else {
        // If there's no numeric prefix, remove everything after "__" or "."
        fileNameClean = fileNameWithoutExtension.split('__')[0].split('.')[0];
    }
    return fileNameClean.trim(); // Remove any leading/trailing whitespace
}
