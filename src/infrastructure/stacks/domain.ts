import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Parameters } from '../../types';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';

interface IProps extends StackProps {
  readonly domainName: string;
  readonly subdomains?: string[];
}

export class Domain extends Stack {
  public readonly hostedZoneId: string;
  public readonly hostedZoneName: string;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    const hostedZone = new PublicHostedZone(
      this,
      `${props.domainName}-hostedZone`,
      {
        zoneName: props.domainName,
      }
    );

    let subdomains = ['*'];

    if (props.subdomains) {
      subdomains = subdomains
        .concat(props.subdomains.filter((subdomain) => subdomain.length > 0))
        .map((subdomain) => `${subdomain}.${props.domainName}`);
    }

    const certificate = new DnsValidatedCertificate(
      this,
      `${props.domainName}-certificate`,
      {
        domainName: props.domainName,
        subjectAlternativeNames: subdomains,
        hostedZone,
      }
    );

    new StringParameter(this, 'domainCertificate', {
      allowedPattern: '.*',
      description: 'Domain Certificate ARM',
      parameterName: Parameters.domainCertificate,
      stringValue: certificate.certificateArn,
      tier: ParameterTier.STANDARD,
    });

    new StringParameter(this, 'hostedZoneId', {
      allowedPattern: '.*',
      description: 'Hosted Zone Id',
      parameterName: Parameters.hostedZoneId,
      stringValue: hostedZone.hostedZoneId,
      tier: ParameterTier.STANDARD,
    });

    new StringParameter(this, 'hostedZoneName', {
      allowedPattern: '.*',
      description: 'Hosted Zone Name',
      parameterName: Parameters.hostedZoneName,
      stringValue: props.domainName,
      tier: ParameterTier.STANDARD,
    });
  }
}
