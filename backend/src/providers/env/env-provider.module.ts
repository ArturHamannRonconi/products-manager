import { Module } from '@nestjs/common';
import { ENV_PROVIDER } from './env-provider.interface';
import { ParameterStoreEnvProvider } from './implementations/parameter-store/parameter-store.env-provider';
import { ProcessEnvProvider } from './implementations/process-env/process-env.env-provider';

@Module({
  exports: [ENV_PROVIDER],
  providers: [
    {
      provide: ENV_PROVIDER,
      useFactory: () => {
        return process.env.NODE_ENV === 'prod'
          ? new ParameterStoreEnvProvider()
          : new ProcessEnvProvider();
      },
    },
  ],
})
export class EnvProviderModule {}
