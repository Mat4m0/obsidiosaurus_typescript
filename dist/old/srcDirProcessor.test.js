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
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const srcDirProcessor_1 = require("./srcDirProcessor");
const assetProcesser_1 = require("./assetProcesser"); // assuming processAssets is in the same directory
const markdownProcessor_1 = require("./markdownProcessor"); // assuming processMarkdown is in the same directory
jest.mock('fs/promises');
jest.mock('path');
jest.mock('./processAssets');
jest.mock('./processMarkdown');
describe('processSrcDir', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should process "docs" directory correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockDirent = (name, isDir) => ({
            name,
            isDirectory: () => isDir,
        });
        fs.readdir.mockResolvedValue([
            mockDirent('ignoreMe', false),
            mockDirent('docs', true),
        ]);
        yield (0, srcDirProcessor_1.processSrcDir)();
        expect(markdownProcessor_1.processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'docs'), 'docs_base', 'docs');
        expect(assetProcesser_1.processAssets).not.toHaveBeenCalled();
    }));
    it('should process "blog" directory correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        fs.readdir.mockResolvedValue(['blog']);
        yield (0, srcDirProcessor_1.processSrcDir)();
        expect(markdownProcessor_1.processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'blog'), 'blog_base', 'blog');
        expect(assetProcesser_1.processAssets).not.toHaveBeenCalled();
    }));
    it('should process "__blog" directories correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        fs.readdir.mockResolvedValue(['foo__blog']);
        yield (0, srcDirProcessor_1.processSrcDir)();
        expect(markdownProcessor_1.processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'foo__blog'), 'blog_multi', 'foo');
        expect(assetProcesser_1.processAssets).not.toHaveBeenCalled();
    }));
    it('should process "assets" directory last', () => __awaiter(void 0, void 0, void 0, function* () {
        fs.readdir.mockResolvedValue(['assets', 'foo__blog']);
        yield (0, srcDirProcessor_1.processSrcDir)();
        expect(markdownProcessor_1.processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'foo__blog'), 'blog_multi', 'foo');
        expect(assetProcesser_1.processAssets).toHaveBeenCalledWith(path.join('srcDir', 'assets'));
    }));
    it('should ignore directories in IGNORED_DIRS', () => __awaiter(void 0, void 0, void 0, function* () {
        fs.readdir.mockResolvedValue(['ignoreMe', 'docs']);
        yield (0, srcDirProcessor_1.processSrcDir)();
        expect(markdownProcessor_1.processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'docs'), 'docs_base', 'docs');
        expect(markdownProcessor_1.processMarkdown).not.toHaveBeenCalledWith(path.join('srcDir', 'ignoreMe'), expect.any(String), expect.any(String));
        expect(assetProcesser_1.processAssets).not.toHaveBeenCalled();
    }));
});
function mockDirent(arg0, arg1) {
    throw new Error('Function not implemented.');
}
function mockDirent(arg0, arg1) {
    throw new Error('Function not implemented.');
}
