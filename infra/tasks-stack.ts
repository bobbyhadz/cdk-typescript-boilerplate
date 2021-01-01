import * as apiGW from '@aws-cdk/aws-apigatewayv2';
import * as apiGWIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

const DEPLOY_ENVIRONMENT = process.env.DEPLOY_ENV || 'dev';
export class TasksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const api = new apiGW.HttpApi(this, 'tasks-api', {
      description: `___${DEPLOY_ENVIRONMENT}___ Api for tasks`,
      apiName: `tasks-api-${DEPLOY_ENVIRONMENT}`,
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          apiGW.HttpMethod.OPTIONS,
          apiGW.HttpMethod.GET,
          apiGW.HttpMethod.POST,
          apiGW.HttpMethod.PUT,
          apiGW.HttpMethod.PATCH,
          apiGW.HttpMethod.DELETE,
        ],
        allowOrigins: ['https://bobbyhadz.com', 'http://localhost:3000'],
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    new cdk.CfnOutput(this, 'apiUrl', {value: api.url!});

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    new cdk.CfnOutput(this, 'tableName', {value: table.tableName});

    const createTaskFunction = new NodejsFunction(this, 'create-task', {
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'main',
      entry: path.join(__dirname, '/../src/create-task/index.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        // FIXME: if function uses layers, layers are already available so put them in externalModules
        externalModules: ['aws-sdk'], // use the 'aws-sdk' available in the Lambda runtime
        // minify: true,
        // sourceMap: true,
      },
    });
    table.grantReadWriteData(createTaskFunction);

    api.addRoutes({
      path: '/tasks',
      methods: [apiGW.HttpMethod.POST],
      integration: new apiGWIntegrations.LambdaProxyIntegration({
        handler: createTaskFunction,
      }),
    });

    const listTaskFunction = new NodejsFunction(this, 'get-task', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main',
      entry: path.join(__dirname, '/../src/list-tasks/index.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(listTaskFunction);

    api.addRoutes({
      path: '/tasks',
      methods: [apiGW.HttpMethod.GET],
      integration: new apiGWIntegrations.LambdaProxyIntegration({
        handler: listTaskFunction,
      }),
    });
  }
}
