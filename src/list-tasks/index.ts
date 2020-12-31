import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';

const dynamoClient = new DynamoDB.DocumentClient();

export async function main(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log('Event', JSON.stringify(event, null, 2));

  const tasks = (await getTasksFromDatabase()).map(task => ({
    id: task.PK,
    name: task.name,
    state: task.state,
  }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tasks),
  };
}

type Task = {
  PK: string;
  name: string;
  state: string;
};

async function getTasksFromDatabase(): Promise<Task[]> {
  const result: DynamoDB.DocumentClient.ItemList = [];

  const res: DynamoDB.DocumentClient.ScanOutput = await dynamoClient
    .scan({
      TableName: process.env.TABLE_NAME,
    })
    .promise();

  if (res.Items) {
    result.push(...res.Items);
  }

  return result as Task[];
}
