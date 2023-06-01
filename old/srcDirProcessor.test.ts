import * as fs from 'fs/promises';
import * as path from 'path';
import { processSrcDir } from './srcDirProcessor';
import { processAssets } from './assetProcesser';  // assuming processAssets is in the same directory
import { processMarkdown } from './markdownProcessor';  // assuming processMarkdown is in the same directory

jest.mock('fs/promises');
jest.mock('path');
jest.mock('./processAssets');
jest.mock('./processMarkdown');

describe('processSrcDir', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process "docs" directory correctly', async () => {
    const mockDirent = (name, isDir) => ({
      name,
      isDirectory: () => isDir,
    });

    (fs.readdir as jest.MockedFunction<typeof fs.readdir>).mockResolvedValue([
      mockDirent('ignoreMe', false),
      mockDirent('docs', true),
    ]);
    await processSrcDir();

    expect(processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'docs'), 'docs_base', 'docs');
    expect(processAssets).not.toHaveBeenCalled();
  });

  it('should process "blog" directory correctly', async () => {
    (fs.readdir as jest.MockedFunction<typeof fs.readdir>).mockResolvedValue(['blog']);

    await processSrcDir();

    expect(processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'blog'), 'blog_base', 'blog');
    expect(processAssets).not.toHaveBeenCalled();
  });

  it('should process "__blog" directories correctly', async () => {
    (fs.readdir as jest.MockedFunction<typeof fs.readdir>).mockResolvedValue(['foo__blog']);

    await processSrcDir();

    expect(processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'foo__blog'), 'blog_multi', 'foo');
    expect(processAssets).not.toHaveBeenCalled();
  });

  it('should process "assets" directory last', async () => {
    (fs.readdir as jest.MockedFunction<typeof fs.readdir>).mockResolvedValue(['assets', 'foo__blog']);

    await processSrcDir();

    expect(processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'foo__blog'), 'blog_multi', 'foo');
    expect(processAssets).toHaveBeenCalledWith(path.join('srcDir', 'assets'));
  });

  it('should ignore directories in IGNORED_DIRS', async () => {
    (fs.readdir as jest.MockedFunction<typeof fs.readdir>).mockResolvedValue(['ignoreMe', 'docs']);

    await processSrcDir();

    expect(processMarkdown).toHaveBeenCalledWith(path.join('srcDir', 'docs'), 'docs_base', 'docs');
    expect(processMarkdown).not.toHaveBeenCalledWith(path.join('srcDir', 'ignoreMe'), expect.any(String), expect.any(String));
    expect(processAssets).not.toHaveBeenCalled();
  });
});
function mockDirent(arg0: string, arg1: boolean): import("fs").Dirent {
  throw new Error('Function not implemented.');
}

function mockDirent(arg0: string, arg1: boolean): import("fs").Dirent {
  throw new Error('Function not implemented.');
}

