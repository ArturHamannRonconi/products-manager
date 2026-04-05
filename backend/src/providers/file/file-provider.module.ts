import { Module } from '@nestjs/common';
import { FILE_PROVIDER } from './file.interface';
import { S3FileProvider } from './implementations/s3/s3.file-provider';
import { NodeFsFileProvider } from './implementations/node-fs/node-fs.file-provider';
import { ENV_PROVIDER, IEnvProvider } from '../env/env-provider.interface';
import { EnvProviderModule } from '../env/env-provider.module';

@Module({
  imports: [EnvProviderModule],
  exports: [FILE_PROVIDER],
  providers: [
    {
      provide: FILE_PROVIDER,
      inject: [ENV_PROVIDER],
      useFactory: async (envProvider: IEnvProvider) => {
        const bucketName = await envProvider.get('S3_BUCKET_NAME');
        
        return process.env.NODE_ENV !== 'prod'
          ? new NodeFsFileProvider() 
          : new S3FileProvider(bucketName);        
      },
    },
  ],
})
export class FileProviderModule {}
