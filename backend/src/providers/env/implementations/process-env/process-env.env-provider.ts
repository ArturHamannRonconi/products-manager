import { IEnvProvider } from '../../env-provider.interface';

export class ProcessEnvProvider implements IEnvProvider {
  async get(key: string): Promise<string> {
    return process.env[key] as string;
  }
}
