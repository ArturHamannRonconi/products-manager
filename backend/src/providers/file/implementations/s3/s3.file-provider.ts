import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IFileProvider } from '../../file.interface';

class S3FileProvider implements IFileProvider {
  private readonly region = "us-east-1";
  private readonly client: S3Client;


  constructor(private readonly bucketName: string) {
    this.client = new S3Client({
      region: this.region
    });
  }

  async upload({
    filename,
    buffer,
    mimetype,
  }: {
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<{ url: string }> {
    await this.client.send(
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
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: filename }),
    );
  }
}

export { S3FileProvider };
