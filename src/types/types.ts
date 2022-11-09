export interface INormalizedResponse<T = { success: boolean }> {
  statusCode: number;
  headers?: {
    Location?: string;
  };
  body?: T;
}

export interface IEnvParameters {
  account?: string;
  region: string;
  domainName: string;
}

export interface IQrCode {
  code: string;
  url: string;
}

export interface ITable {
  streamArn?: string;
  name: string;
}
