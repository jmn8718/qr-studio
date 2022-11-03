import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { QrStudioStack } from './stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/qr-studio-stack.ts
describe('', () => {
  test('stack created', () => {
    const app = new cdk.App();
    const stack = new QrStudioStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);

    //   template.hasResourceProperties('AWS::SQS::Queue', {
    //     VisibilityTimeout: 300
    //   });
  });
});
