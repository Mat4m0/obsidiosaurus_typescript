import { File } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

export const logger = pino();

const docusaurusFolder = "website"


type MainFolder = {
    [key: string]: { type: string };
  }

type File = {
  fileName: string;
  fileNameClean: string;
  fileExtension: string;
  mainFolder: string;
  parentFolder: string;
  type: string;
  pathSource: string;
  pathTarget: string;
  dateModified: Date;
  size: number;
  language: string;
}

type Settings = {
  mainLanguage: string;
};

const settings: Settings = {
  mainLanguage: "en",
};
  
type Files = File[]


function getMainfolders(folderPath: string): MainFolder[] {
  const subfolders: MainFolder[] = [];
  const absoluteFolderPath = path.resolve(folderPath);

  try {
    const files = fs.readdirSync(absoluteFolderPath);

    files.forEach(file => {
      const filePath = path.join(absoluteFolderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        let type: string;
        if (file === '.obsidian') {
          type = 'ignore';
        } else if (file.endsWith('__blog')) {
          type = 'blog';
        } else {
          type = file;
        }
        if (type !== 'ignore') {
        const folderObject: MainFolder = {};
        folderObject[file] = { type };

        subfolders.push(folderObject);
      }
    }
    });
  } catch (err) {
    logger.error(`Error reading the folder ${absoluteFolderPath}: ${err.message}`);
  }
  
  return subfolders;
}

const folderPath = 'test_vault';

const mainFolders = getMainfolders(folderPath);
logger.info(`Subfolders: ${mainFolders}`);

// Write subfolders to a JSON file
const jsonOutput = JSON.stringify(mainFolders, null, 2);
const outputPath = 'output.json';

try {
  fs.writeFileSync(outputPath, jsonOutput);
  console.log('JSON file written successfully!');
} catch (err) {
  console.error('Error writing JSON file:', err);
}

// Usage
const filePath = 'G:/obsidiosaurus_typescript/test_vault/blog/2022-01-24-Post1/2022-01-24-Post1__de.md';
console.log(getFileInfo(filePath));

const filePath2 ="G:/obsidiosaurus_typescript/test_vault/assets/excalidraw showcase v1.excalidraw.light.svg"
console.log(getFileInfo(filePath2));

const filePath3 = "G:/obsidiosaurus_typescript/test_vault/docs/sidebar2/1. Topic Y/1. Note Y1.md"
console.log(getFileInfo(filePath3));

function getFileInfo(filePath: string): Partial<File> {
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const { fileNameClean, fileExtension, language } = sanitizeFileName(fileName);
  
  const fileInfo: Partial<File> = {
    fileName,
    fileNameClean,
    fileExtension,
    language,
    mainFolder: path.basename(path.dirname(filePath)),
    parentFolder: path.basename(path.dirname(path.dirname(filePath))),
    pathSource: path.resolve(filePath),
    dateModified: stats.mtime,
    size: stats.size
  };

  return fileInfo;
}

function sanitizeFileName(fileName: string): {fileNameClean: string, fileExtension: string, language: string | null} {
  const parsedPath = path.parse(fileName);
  const fileNameWithoutExtension = parsedPath.name;
  const fileExtension = parsedPath.ext;
  const prefixMatch = fileNameWithoutExtension.match(/^(\d+[\.)])/);

  let fileNameClean;
  if (prefixMatch) {
    console.log("test")
    const baseName = fileNameWithoutExtension.replace(prefixMatch[0], '');
    fileNameClean = baseName;
  } else {
    fileNameClean = fileNameWithoutExtension.split('.')[0];
  }

  const languageMatch = fileNameClean.match(/__([a-z]{2})$/i); // match any two-letter code after "__"
  const language = languageMatch ? languageMatch[1] : settings.mainLanguage;

  return { fileNameClean: fileNameClean.trim(), fileExtension, language };
}

