#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EphemeralFargateStack } from '../lib/ephemeral-fargate-stack';

const app = new cdk.App();

const vpcId = 'vpc-0f388b90c18ada097';  // <-- replace or set to '' to create new

new EphemeralFargateStack(app, 'EphemeralFargateStack', {
  vpcId,

  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
