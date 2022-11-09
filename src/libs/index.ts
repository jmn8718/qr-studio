import { DynamoDB } from 'aws-sdk';
import { TableAttributes } from '../types';

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-table-read-write.html
const table = new DynamoDB({});

export const getItem = async <T = Record<string, unknown>>(params: {
  tableName: string;
  code: string;
}): Promise<T | undefined> => {
  const result = await new Promise((resolve, reject) => {
    table.getItem(
      {
        TableName: params.tableName,
        Key: {
          [TableAttributes.PK]: { S: params.code },
        },
      },
      (err, data) => {
        if (err) reject(err);
        if (data?.Item) {
          resolve({
            code: data.Item[TableAttributes.PK].S,
            url: data.Item.url.S,
          });
        }
        resolve(undefined);
      }
    );
  });
  return result as T;
};

export const putItem = async <T = Record<string, unknown>>(params: {
  payload: {
    code: string;
    url: string;
  };
  tableName: string;
}): Promise<T> => {
  const result = await new Promise((resolve, reject) => {
    table.putItem(
      {
        TableName: params.tableName,
        Item: {
          [TableAttributes.PK]: { S: params.payload.code },
          url: { S: params.payload.url },
        },
      },
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      }
    );
  });
  return result as T;
};
