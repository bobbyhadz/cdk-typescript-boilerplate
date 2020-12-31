import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';

const dynamoClient = new DynamoDB.DocumentClient();

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
    name: task.name,
    state: task.state,
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

type Task = {
  PK: string;
  name: string;
  state: string;
};

// Helper method to fetch all tasks
async function getTasksFromDatabase(): Promise<Task[]> {
  // This variable will hold our paging key
  let startKey;
  // start with an empty list of tasks
  const result: DynamoDB.DocumentClient.ItemList = [];

  // start a fetch loop
  // Scan the table for all tasks
  const res: DynamoDB.DocumentClient.ScanOutput = await dynamoClient
    .scan({
      TableName: process.env.TABLE_NAME,
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
  // return the accumulated list of tasks
  return result as Task[];
}
