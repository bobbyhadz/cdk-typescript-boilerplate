import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
import {v4} from 'uuid';

const dynamoClient = new DynamoDB.DocumentClient();

export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log('Event', JSON.stringify(event, null, 2));

  if (!event.body) {
    return {
      statusCode: 400,
    };
  }

  const task = JSON.parse(event.body) as {name: string; state: string};
  const id = v4();

  await dynamoClient
    .put({
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: id,
        name: task.name,
        state: task.state,
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({...task, id}),
  };
}
