
import {
  GetParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { IEnvProvider } from '../../env-provider.interface';

export class ParameterStoreEnvProvider implements IEnvProvider {
  private readonly client: SSMClient;
  private readonly region = "us-east-1";

  constructor() {
    this.client = new SSMClient({
      region: this.region
    });
  }

  async get(key: string): Promise<string> {
    const command = new GetParameterCommand({
      Name: `/${key}`,
      WithDecryption: true,
    });
    const response = await this.client.send(command);
    return response.Parameter?.Value as string;
  }
}
