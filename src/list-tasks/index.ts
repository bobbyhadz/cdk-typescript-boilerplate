import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
import {generateResponse} from '../utils/generate-response';
import {returnError} from '../utils/returnError';

const dynamoClient = new DynamoDB.DocumentClient();

type Task = {
  PK: string;
  name: string;
  state: string;
};

export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log('Event', JSON.stringify(event, null, 2));

  try {
    const response = await dynamoClient
      .scan({
        TableName: process.env.TABLE_NAME,
      })
      .promise();

    if (response.Items) {
      return generateResponse({
        statusCode: 200,
        body: (response.Items as Task[]).map(task => ({
          id: task.PK,
          name: task.name,
          state: task.state,
        })),
      });
    }

    throw new Error('Unable to fetch tasks');
  } catch (error) {
    return returnError({
      statusCode: 500,
      err: error as string,
    });
  }
}
