import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { FILE_PROVIDER } from './file.interface';
import { S3FileProvider } from './implementations/s3/s3.file-provider';
import { NodeFsFileProvider } from './implementations/node-fs/node-fs.file-provider';
import { ENV_PROVIDER, IEnvProvider } from '../env/env-provider.interface';
import { EnvProviderModule } from '../env/env-provider.module';

@Module({
  imports: [EnvProviderModule],
  providers: [
    {
      provide: FILE_PROVIDER,
      useFactory: async (envProvider: IEnvProvider) => {
        if (process.env.NODE_ENV !== 'prod') {
          return new NodeFsFileProvider();
        }
        const region = await envProvider.get('AWS_REGION');
        const accessKeyId = await envProvider.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = await envProvider.get('AWS_SECRET_ACCESS_KEY');
        const bucketName = await envProvider.get('S3_BUCKET_NAME');

        const s3Client = new S3Client({
          region,
          credentials: {
            accessKeyId: accessKeyId!,
            secretAccessKey: secretAccessKey!,
          },
        });
        return new S3FileProvider(s3Client, bucketName!, region!);
      },
      inject: [ENV_PROVIDER],
    },
  ],
  exports: [FILE_PROVIDER],
})
export class FileProviderModule {}
