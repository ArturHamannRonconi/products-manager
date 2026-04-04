import { S3Client } from '@aws-sdk/client-s3';
import { S3FileProvider } from './s3.file-provider';

describe('S3FileProvider', () => {
  let provider: S3FileProvider;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn().mockResolvedValue({});
    const s3Client = { send: mockSend } as unknown as S3Client;
    provider = new S3FileProvider(s3Client, 'my-bucket', 'us-east-1');
  });

  it('should upload a file and return the correct URL', async () => {
    const result = await provider.upload({
      filename: 'test-image.png',
      buffer: Buffer.from('fake-content'),
      mimetype: 'image/png',
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(result.url).toBe('https://my-bucket.s3.us-east-1.amazonaws.com/test-image.png');
  });

  it('should delete a file', async () => {
    await provider.delete('test-image.png');
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
