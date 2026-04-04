import * as fs from 'node:fs';
import * as path from 'node:path';
import { IFileProvider } from '../../file.interface';

class NodeFsFileProvider implements IFileProvider {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload({
    filename,
    buffer,
  }: {
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<{ url: string }> {
    fs.writeFileSync(path.join(this.uploadDir, filename), buffer);
    return { url: `/uploads/${filename}` };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export { NodeFsFileProvider };
