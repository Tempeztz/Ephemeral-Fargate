import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';

interface EphemeralFargateStackProps extends StackProps {
  vpcId?: string;  // optional VPC ID to use
}

export class EphemeralFargateStack extends Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: cdk.App, id: string, props?: EphemeralFargateStackProps) {
    super(scope, id, props);

    // --- VPC logic ---
    if (props?.vpcId && props.vpcId !== '') {
      this.vpc = ec2.Vpc.fromLookup(this, 'ImportedVPC', {
        vpcId: props.vpcId,
      });
    } else {
      this.vpc = new ec2.Vpc(this, 'NewVPC', {
        maxAzs: 2,
        natGateways: 1,
      });
    }

    // --- Example: create an ECS cluster in the VPC ---
    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc: this.vpc,
    });

    // --- Existing Lambda and EventBridge self-destruct ---
    const stackName = this.stackName;

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

    destroyLambda.addPermission('AllowEventBridgeInvoke', {
      principal: new iam.ServicePrincipal('events.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: `arn:aws:events:${this.region}:${this.account}:rule/SelfDestructRule`,
    });

    const rule = new events.Rule(this, 'SelfDestructRule', {
      schedule: events.Schedule.expression('rate(2 minutes)'),
    });

    rule.addTarget(new targets.LambdaFunction(destroyLambda));
  }
}
