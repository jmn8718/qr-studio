import { getItem } from '../../libs';
import type { IQrCode } from '../../types';

export default async function controller(params: {
  code: string;
  tableName: string;
}): Promise<string | undefined> {
  const result = await getItem<IQrCode>(params);
  return result?.url;
}
