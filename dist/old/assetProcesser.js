"use strict";
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
exports.processAssets = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const imageUtils_1 = require("./imageUtils");
const fileUtils_1 = require("./fileUtils");
const configParser_1 = require("./configParser");
const main_1 = require("./main");
const { DST_ASSET_SUBFOLDER, DST_DIR } = (0, configParser_1.readConfiguration)();
function convertExcalidraw(line) {
    return __awaiter(this, void 0, void 0, function* () {
        if (line.includes(".excalidraw]]")) {
            const match = line.match(/(.+\/)(.+)(\.excalidraw)/);
            if (match) {
                const fileName = match[2].replace(' ', '-');
                line = `![](/${DST_ASSET_SUBFOLDER}/${fileName}.excalidraw.dark.svg#dark)\n![](/assets/${fileName}.excalidraw.light.svg#light)\n`;
            }
        }
        return line;
    });
}
function convertSvg(line) {
    return __awaiter(this, void 0, void 0, function* () {
        if (line.includes(".svg]]")) {
            const match = line.match(/(.+\/)(.+)(\.svg)/);
            if (match) {
                const fileName = match[2].replace(' ', '-');
                line = `![](/${DST_ASSET_SUBFOLDER}/${fileName}.svg)\n`;
            }
        }
        return line;
    });
}
function processAssets(searchFolder) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs_1.promises.readdir(searchFolder);
            const dstDirPath = (0, path_1.join)(DST_DIR, 'static', DST_ASSET_SUBFOLDER);
            for (const file of files) {
                const fileName = (0, fileUtils_1.convertWhitespaces)(file);
                const dstFilePath = (0, path_1.join)(dstDirPath, fileName);
                if (file.endsWith(".jpg") || file.endsWith(".png")) {
                    yield (0, imageUtils_1.convertAndResizeImage)(file, searchFolder);
                }
                else if (!file.endsWith(".excalidraw.md")) {
                    yield fs_1.promises.copyFile((0, path_1.join)(searchFolder, file), dstFilePath);
                }
            }
        }
        catch (error) {
            main_1.logger.error(`Error processing assets: ${error}`);
        }
    });
}
exports.processAssets = processAssets;
