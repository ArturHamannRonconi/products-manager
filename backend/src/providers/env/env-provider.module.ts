import { Module } from '@nestjs/common';
import { ENV_PROVIDER } from './env-provider.interface';
import { ParameterStoreEnvProvider } from './implementations/parameter-store/parameter-store.env-provider';
import { ProcessEnvProvider } from './implementations/process-env/process-env.env-provider';

@Module({
  providers: [
    {
      provide: ENV_PROVIDER,
      useFactory: () => {
        if (process.env.NODE_ENV === 'prod') {
          return new ParameterStoreEnvProvider();
        }
        return new ProcessEnvProvider();
      },
    },
  ],
  exports: [ENV_PROVIDER],
})
export class EnvProviderModule {}
