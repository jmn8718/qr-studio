import * as cdk from 'aws-cdk-lib';
import {faker} from '@faker-js/faker';
import { Template } from 'aws-cdk-lib/assertions';
import { Domain } from './domain';
import { Parameters } from '../../types';

describe('domain stack', () => {
  test('create stack only with domainName', () => {
    const app = new cdk.App();
    const stack = new Domain(app, 'MyTestStack', {
      domainName: faker.internet.domainName()
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::SSM::Parameter', {
      "Name": Parameters.domainCertificate
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      "Name": Parameters.hostedZoneId
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      "Name": Parameters.hostedZoneName
    });
  });

  test('create stack with domainName and subdomains', () => {
    const app = new cdk.App();
    const stack = new Domain(app, 'MyTestStack', {
      domainName: faker.internet.domainName(),
      subdomains: [faker.internet.domainWord()]
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::SSM::Parameter', {
      "Name": Parameters.domainCertificate
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      "Name": Parameters.hostedZoneId
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      "Name": Parameters.hostedZoneName
    });
  });
});
