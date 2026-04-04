export const FILE_PROVIDER = 'FILE_PROVIDER';

export interface IFileProvider {
  upload(params: {
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<{ url: string }>;

  delete(filename: string): Promise<void>;
}
