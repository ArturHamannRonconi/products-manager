import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { NodeFsFileProvider } from './node-fs.file-provider';

describe('NodeFsFileProvider', () => {
  let provider: NodeFsFileProvider;
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node-fs-test-'));
    provider = new NodeFsFileProvider();
    (provider as any).uploadDir = tempDir;
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should upload a file and return the correct URL', async () => {
    const filename = 'test-file.txt';
    const buffer = Buffer.from('hello world');

    const result = await provider.upload({ filename, buffer, mimetype: 'text/plain' });

    expect(result.url).toBe(`/uploads/${filename}`);
    const filePath = path.join(tempDir, filename);
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath)).toEqual(buffer);
  });

  it('should delete an existing file', async () => {
    const filename = 'to-delete.txt';
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, 'content');

    await provider.delete(filename);

    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('should not throw when deleting a non-existent file', async () => {
    await expect(provider.delete('non-existent.txt')).resolves.not.toThrow();
  });
});
