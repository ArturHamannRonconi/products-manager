export const ENV_PROVIDER = 'ENV_PROVIDER';

export interface IEnvProvider {
  get(key: string): Promise<string | undefined>;
}
