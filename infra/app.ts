#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import {CdkDemoStack} from './cdk-demo-stack';

const app = new cdk.App();
new CdkDemoStack(app, 'tasks-dev', {
  stackName: 'tasks-dev',
  env: {
    region: 'eu-central-1',
  },
  tags: {
    env: 'dev',
  },
});

// FIXME: Uncomment if you want a prod stack as well

// new CdkDemoStack(app, 'tasks-prod', {
//   stackName: 'tasks-prod',
//   env: {
//     region: 'eu-central-1',
//   },
//   tags: {
//     env: 'prod',
//   },
// });
