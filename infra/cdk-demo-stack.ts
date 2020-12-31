import * as apiGW from '@aws-cdk/aws-apigatewayv2';
import * as apiGWIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

export class CdkDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    new cdk.CfnOutput(this, 'TableName', {value: table.tableName});

    const createTaskFunction = new NodejsFunction(this, 'create-task', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main', // name of the exported function
      entry: path.join(__dirname, '/../src/create-task/index.ts'), // file to use as entry point for our Lambda function
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

    // Grant full access to the data
    table.grantReadWriteData(createTaskFunction);

    const listTaskFunction = new NodejsFunction(this, 'get-task', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main',
      entry: path.join(__dirname, '/../src/list-tasks/index.ts'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant only read access for this function
    table.grantReadData(listTaskFunction);

    const api = new apiGW.HttpApi(this, 'tasks-api');
    new cdk.CfnOutput(this, 'ApiUrl', {value: api.url!});

    api.addRoutes({
      path: '/tasks',
      methods: [apiGW.HttpMethod.POST],
      integration: new apiGWIntegrations.LambdaProxyIntegration({
        handler: createTaskFunction,
      }),
    });

    api.addRoutes({
      path: '/tasks',
      methods: [apiGW.HttpMethod.GET],
      integration: new apiGWIntegrations.LambdaProxyIntegration({
        handler: listTaskFunction,
      }),
    });
  }
}
