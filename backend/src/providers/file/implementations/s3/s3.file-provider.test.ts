import { S3Client } from '@aws-sdk/client-s3';
import { S3FileProvider } from './s3.file-provider';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn().mockImplementation((params) => params),
  DeleteObjectCommand: jest.fn().mockImplementation((params) => params),
}));

const MockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;

describe('S3FileProvider', () => {
  let provider: S3FileProvider;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn().mockResolvedValue({});
    MockedS3Client.mockImplementation(() => ({ send: mockSend }) as any);
    provider = new S3FileProvider('my-bucket');
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
