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
exports.processSrcDir = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const configParser_1 = require("./configParser");
const markdownProcessor_1 = require("./markdownProcessor");
const assetProcesser_1 = require("./old/assetProcesser");
/**
 * Processes the source directory `SRC_DIR` and its subdirectories.
 *
 * The function retrieves the list of subdirectories in `SRC_DIR` and removes
 * the subdirectories that are listed in the global variable `IGNORED_DIRS`.
 * Then, the function checks each subdirectory against several conditions to
 * determine the content type and name. The content type and name are used
 * to call different processing functions.
 */
function processSrcDir() {
    return __awaiter(this, void 0, void 0, function* () {
        const { SRC_DIR, ASSET_FOLDER_NAME, IGNORED_DIRS } = (0, configParser_1.readConfiguration)();
        let contentType = "";
        let contentName = "";
        // Makes sure that "asset" folder is always last to process
        // Remove from list
        const folderList = (yield fs.promises.readdir(SRC_DIR)).filter((d) => !IGNORED_DIRS.includes(d) && d !== ASSET_FOLDER_NAME);
        // Add asset folder to end of list
        for (const folder of [...folderList, ASSET_FOLDER_NAME]) {
            const searchFolder = path.join(SRC_DIR, folder);
            if (folder === "docs") {
                contentType = "docs_base";
                contentName = "docs";
            }
            else if (folder === "blog") {
                contentType = "blog_base";
                contentName = "blog";
            }
            else if (folder.endsWith("__blog")) {
                contentType = "blog_multi";
                contentName = folder.slice(0, -("__blog".length));
            }
            else if (folder === ASSET_FOLDER_NAME) {
                contentType = "asset";
                contentName = "assets";
                yield (0, assetProcesser_1.processAssets)(searchFolder);
                continue;
            }
            yield (0, markdownProcessor_1.processMarkdown)(searchFolder, contentType, contentName);
        }
    });
}
exports.processSrcDir = processSrcDir;
