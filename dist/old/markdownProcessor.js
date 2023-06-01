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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFile = exports.processMarkdown = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const configParser_1 = require("./configParser");
const fileUtils_1 = require("./fileUtils");
/**
 * Processes markdown files in a given folder.
 *
 * This function checks if internationalization is supported and handles file
 * names and paths accordingly. It then builds the destination path for each
 * file and converts the file.
 */
function processMarkdown(searchFolder, contentType, contentName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { SRC_DIR, DST_DIR, LOG_FILE_PATH, SUPPORTED_ADMONITION_TYPES, IMAGE_DETAILS, DST_ASSET_SUBFOLDER, CONVERT_IMAGE_TYPE, LANGUAGE_SEPARATOR, I18N_SUPPORTED } = (0, configParser_1.readConfiguration)();
        // Recursive directory walking using Promises
        const walk = (dir) => __awaiter(this, void 0, void 0, function* () {
            let files = yield (0, util_1.promisify)(fs.readdir)(dir);
            files = yield Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                const filePath = path.join(dir, file);
                const stats = yield (0, util_1.promisify)(fs.stat)(filePath);
                if (stats.isDirectory())
                    return walk(filePath);
                else if (stats.isFile())
                    return filePath;
            })));
            return files.reduce((all, folderContents) => all.concat(folderContents), []);
        });
        const markdownFiles = (yield walk(searchFolder)).filter(f => f.endsWith('.md') && !f.endsWith('excalidraw.md'));
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
                const grouped = (0, fileUtils_1.checkI18nGrouping)(splittedPath[pathDepth - 2], fileName);
                if (grouped) {
                    splittedPath.pop();
                    splittedPath[splittedPath.length - 1] += '.md';
                }
            }
            const [language, secondaryLanguage] = (0, fileUtils_1.checkLanguage)(fileName);
            const newFileName = splittedPath[splittedPath.length - 1];
            for (let i = 0; i < splittedPath.length; i++) {
                splittedPath[i] = (0, fileUtils_1.convertWhitespaces)(splittedPath[i]);
            }
            const path = splittedPath.join('/');
            const relDstFilePath = (0, fileUtils_1.buildRelDstPath)(path, language, secondaryLanguage, contentType, contentName);
            const absDstFilePath = path.join(DST_DIR, relDstFilePath.slice(1));
            fs.mkdirSync(path.dirname(absDstFilePath), { recursive: true });
            yield convertFile(absSrcFilePath, absDstFilePath, contentType);
            (0, fileUtils_1.writeLogFile)(newFileName, relDstFilePath, DST_DIR, LOG_FILE_PATH);
        }
    });
}
exports.processMarkdown = processMarkdown;
// This is a placeholder for the convertFile function. 
// You will need to implement this function based on the Python code provided.
function convertFile(inputFile, outputFile, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const { CONTENT_TYPE } = (0, configParser_1.readConfiguration)();
        // Read the input file
        const fileContent = yield (0, util_1.promisify)(fs.readFile)(inputFile, 'utf8');
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
        yield (0, util_1.promisify)(fs.writeFile)(outputFile, outputLines.join('\n'));
    });
}
exports.convertFile = convertFile;
