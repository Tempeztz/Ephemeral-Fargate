#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EphemeralFargateStack } from '../lib/ephemeral-fargate-stack';

const app = new cdk.App();
new EphemeralFargateStack(app, 'EphemeralFargateStack');
