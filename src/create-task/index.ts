import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
import {v4} from 'uuid';
import {generateResponse} from '../utils/generate-response';
import {returnError} from '../utils/returnError';

const dynamoClient = new DynamoDB.DocumentClient();

export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log('Event', JSON.stringify(event, null, 2));

  const propertiesRequiredError = {
    statusCode: 400,
    body: {error: 'Properties name and state are required.'},
  };

  if (!event.body) {
    return generateResponse(propertiesRequiredError);
  }

  const {name, state} = JSON.parse(event.body) as {name: string; state: string};
  if (!name || !state) {
    return generateResponse(propertiesRequiredError);
  }

  const id = v4();

  try {
    await dynamoClient
      .put({
        TableName: process.env.TABLE_NAME,
        Item: {
          PK: id,
          name,
          state,
        },
      })
      .promise();

    return generateResponse({
      statusCode: 200,
      body: {id, name, state},
    });
  } catch (error) {
    return returnError({
      statusCode: 500,
      err: error as string,
    });
  }
}
