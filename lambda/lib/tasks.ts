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

// Export new function to be called by Lambda
export async function get(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  // Log the event to debug the application during development
  console.log(event);

  // Get a list of all tasks from the DB, extract the method to do paging
  const tasks = (await getTasksFromDatabase()).map(task => ({
    // let's reformat the data to our API model
    id: task.PK,
    name: task.Name,
    state: task.State,
  }));

  // Return the list as JSON objects
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    // Body needs to be string so render the JSON to string
    body: JSON.stringify(tasks),
  };
}

// Helper method to fetch all tasks
async function getTasksFromDatabase(): Promise<DynamoDB.DocumentClient.ItemList> {
  // This variable will hold our paging key
  let startKey;
  // start with an empty list of tasks
  const result: DynamoDB.DocumentClient.ItemList = [];

  // start a fetch loop
  do {
    // Scan the table for all tasks
    const res: DynamoDB.DocumentClient.ScanOutput = await dynamoClient
      .scan({
        TableName: env.TABLE_NAME!,
        // Start with the given paging key
        ExclusiveStartKey: startKey,
      })
      .promise();
    // If we got tasks, store them into our list
    if (res.Items) {
      result.push(...res.Items);
    }
    // Keep the new paging token if there is one and repeat when necessary
    startKey = res.LastEvaluatedKey;
  } while (startKey);
  // return the accumulated list of tasks
  return result;
}
