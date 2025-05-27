import { App } from 'aws-cdk-lib';
import { EphemeralFargateStack } from '../lib/ephemeral-fargate-stack';
import { Match, Template } from 'aws-cdk-lib/assertions';

describe('EphemeralFargateStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new EphemeralFargateStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('creates a Lambda function with inline code and timeout 30s', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Timeout: 30,
    });
  });

  test('Lambda function has policy allowing cloudformation:DeleteStack', () => {
    template.hasResource('AWS::IAM::Policy', {
      Properties: Match.objectLike({
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 'cloudformation:DeleteStack',
              Effect: 'Allow',
              Resource: '*',
            }),
          ]),
        },
      }),
    });
  });

  test('creates an EventBridge rule that triggers every 2 minutes', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      ScheduleExpression: 'rate(2 minutes)',
    });
  });

  test('adds Lambda as a target to the EventBridge rule', () => {
    template.hasResource('AWS::Events::Rule', {
      Properties: Match.objectLike({
        Targets: Match.arrayWith([
          Match.objectLike({
            Arn: {
              'Fn::GetAtt': Match.arrayWith([
                Match.stringLikeRegexp('DestroyStackLambda'),
                'Arn',
              ]),
            },
            Id: 'Target0',
          }),
        ]),
      }),
    });
  });

  test('Lambda has permission to be invoked by EventBridge', () => {
    template.hasResourceProperties('AWS::Lambda::Permission', {
      Action: 'lambda:InvokeFunction',
      Principal: 'events.amazonaws.com',
    });
  });
});
