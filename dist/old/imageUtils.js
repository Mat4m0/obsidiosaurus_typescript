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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAndResizeImage = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const configParser_1 = require("./configParser");
const fileUtils_1 = require("./fileUtils");
/**
 * Converts and resizes an image.
 *
 * @param image - Name of the image file.
 * @param srcPath - Source path of the image file.
 */
function convertAndResizeImage(image, srcPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const { IMAGE_DETAILS, CONVERT_IMAGE_MAX_WIDTH, CONVERT_IMAGE_TYPE, DST_DIR, DST_ASSET_SUBFOLDER } = (0, configParser_1.readConfiguration)();
        const filePath = path.join(srcPath, image);
        let img = (0, sharp_1.default)(filePath);
        const imageMetaData = yield img.metadata();
        let width;
        let height;
        for (const imageDetail of IMAGE_DETAILS) {
            if (imageDetail.filename === image) {
                width = imageDetail.width !== undefined ? parseInt(imageDetail.width) : undefined;
                height = imageDetail.height !== undefined ? parseInt(imageDetail.height) : undefined;
                if (imageMetaData.width > CONVERT_IMAGE_MAX_WIDTH && width === undefined) {
                    width = CONVERT_IMAGE_MAX_WIDTH;
                    height = Math.floor((width * imageMetaData.height) / imageMetaData.width);
                }
                else if (width === undefined && height === undefined) {
                    height = imageMetaData.height;
                    width = imageMetaData.width;
                }
                else if (width !== undefined && height === undefined) {
                    height = Math.floor((width * imageMetaData.height) / imageMetaData.width);
                }
                else {
                    width = Math.floor((height * imageMetaData.width) / imageMetaData.height);
                }
                img = img.resize(width, height);
                const dstDirPath = path.join(DST_DIR, 'static', DST_ASSET_SUBFOLDER);
                const exists = yield fs_1.promises.access(dstDirPath).then(() => true).catch(() => false);
                if (!exists) {
                    yield fs_1.promises.mkdir(path.dirname(dstDirPath), { recursive: true });
                }
                const fileName = `${(0, fileUtils_1.convertWhitespaces)(imageDetail.filename_new)}.${CONVERT_IMAGE_TYPE}`;
                const dstFilePath = path.join(dstDirPath, fileName);
                yield img.toFile(dstFilePath);
            }
        }
    });
}
exports.convertAndResizeImage = convertAndResizeImage;
