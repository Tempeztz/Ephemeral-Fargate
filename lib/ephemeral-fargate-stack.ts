import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

export class EphemeralFargateStack extends Stack {
  constructor(scope: cdk.App, id: string, props?: StackProps) {
    super(scope, id, props);

    const stackName = this.stackName;

    // Lambda to destroy the stack
    const destroyLambda = new lambda.Function(this, 'DestroyStackLambda', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        exports.handler = async () => {
          const cf = new AWS.CloudFormation();
          console.log('Deleting stack: ${stackName}');
          await cf.deleteStack({ StackName: '${stackName}' }).promise();
        };
      `),
      timeout: Duration.seconds(30),
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['cloudformation:DeleteStack'],
          resources: ['*'],
        }),
      ],
    });

    // Allow EventBridge to invoke Lambda
    destroyLambda.addPermission('AllowEventBridgeInvoke', {
      principal: new iam.ServicePrincipal('events.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/SelfDestructRule`,
    });

    // EventBridge rule: 2 minute timer
    const rule = new events.Rule(this, 'SelfDestructRule', {
      schedule: events.Schedule.expression('rate(2 minutes)'),
    });

    rule.addTarget(new targets.LambdaFunction(destroyLambda));
  }
}
