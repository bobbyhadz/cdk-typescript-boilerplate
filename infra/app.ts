#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import 'source-map-support/register';
import {CdkDemoStack} from './cdk-demo-stack';

const app = new cdk.App();

// DEV Stack
new CdkDemoStack(app, 'tasks-dev', {
  stackName: 'tasks-dev',
  env: {
    region: 'eu-central-1',
  },
  tags: {
    env: 'dev',
  },
});

// PROD Stack

new CdkDemoStack(app, 'tasks-prod', {
  stackName: 'tasks-prod',
  env: {
    region: 'eu-central-1',
  },
  tags: {
    env: 'prod',
  },
});
