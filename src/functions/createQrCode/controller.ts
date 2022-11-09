import { putItem } from '../../libs';
import type { IQrCode } from '../../types';

export default async function controller(params: {
  payload: {
    code: string;
    url: string;
  };
  tableName: string;
}): Promise<{
  statusCode: number;
  body: Record<string, unknown>;
}> {
  const result = await putItem<IQrCode>(params);
  return {
    statusCode: 200,
    body: {
      success: true,
    },
  };
}
