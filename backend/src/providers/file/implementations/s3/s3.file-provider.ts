import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IFileProvider } from '../../file.interface';

class S3FileProvider implements IFileProvider {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string,
    private readonly region: string,
  ) {}

  async upload({
    filename,
    buffer,
    mimetype,
  }: {
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<{ url: string }> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read',
      }),
    );
    return { url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filename}` };
  }

  async delete(filename: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: filename }),
    );
  }
}

export { S3FileProvider };
