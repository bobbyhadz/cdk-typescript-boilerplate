import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
import {env} from 'process';
import {v4} from 'uuid';

const dynamoClient = new DynamoDB.DocumentClient();

// Export new function to be called by Lambda
export async function post(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  // Log the event to debug the application during development
  console.log(event);

  // If we do not receive a body, we cannot continue...
  if (!event.body) {
    // ...so we return a Bad Request response
    return {
      statusCode: 400,
    };
  }

  // As we made sure we have a body, let's parse it
  const task = JSON.parse(event.body);
  // Let's create a new UUID for the task
  const id = v4();

  // define a new task entry and await its creation
  const put = await dynamoClient
    .put({
      TableName: env.TABLE_NAME!,
      Item: {
        // Hash key is set to the new UUID
        PK: id,
        // we just use the fields from the body
        Name: task.name,
        State: task.state,
      },
    })
    .promise();

  // Tell the caller that everything went great
  return {
    statusCode: 200,
    body: JSON.stringify({...task, id}),
  };
}
