import type {
  Context,
  APIGatewayProxyResult,
  APIGatewayEvent,
} from 'aws-lambda';
import { get as envGet } from 'env-var';
import controller from './controller';
import { Environments } from '../../types';

const { tableName } = {
  tableName: envGet(Environments.tableName).required().asString(),
};

// https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  try {
    const url = await controller({
      code: event.pathParameters!.code as string,
      tableName,
    });
    if (!url) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Not Found',
          code: 'not_found',
        }),
      };
    }
    return {
      statusCode: 302,
      headers: {
        Location: url,
      },
      body: '',
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal error',
        code: 'internal_error',
      }),
    };
  }
};

export default handler;
