import { Duration, StackProps } from 'aws-cdk-lib';
import { Environments, ITable, Parameters } from '../../types';
import { Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { join } from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { functionsDirname } from '../../dirname';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import { HttpMethods } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';

interface IProps extends StackProps {
  readonly table: ITable;
}

export class PublicApi extends Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    const hostedZoneName = StringParameter.fromStringParameterAttributes(
      this,
      'publicApi-hostedZoneName',
      {
        parameterName: Parameters.hostedZoneName,
      }
    ).stringValue;
    const hostedZoneId = StringParameter.fromStringParameterAttributes(
      this,
      'publicApi-hostedZoneId',
      {
        parameterName: Parameters.hostedZoneId,
      }
    ).stringValue;

    const hostedZone = HostedZone.fromHostedZoneAttributes(
      this,
      'publicApi-hostedZone',
      {
        hostedZoneId: hostedZoneId,
        zoneName: hostedZoneName,
      }
    );

    // create api gateway
    // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-apigateway-readme.html#deployments
    const restApi = new RestApi(this, 'publicApi', {
      domainName: {
        domainName: hostedZoneName,
        certificate: Certificate.fromCertificateArn(
          this,
          'publicApi-certificate',
          StringParameter.fromStringParameterAttributes(this, 'certificate', {
            parameterName: Parameters.domainCertificate,
          }).stringValue
        ),
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
    });

    // assing api to arecord on the hosted zone
    // https://docs.aws.amazon.com/cdk/api/v1/docs/aws-apigateway-readme.html#custom-domains
    new ARecord(this, 'publicApi-record', {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGateway(restApi)),
    });

    // import table
    const table = Table.fromTableAttributes(this, 'publicApi-table', {
      tableName: props.table.name,
      tableStreamArn: props.table.streamArn,
    });

    // create functions
    const handleQrcodeHandler = new NodejsFunction(
      this,
      'handleQrcodeHandler',
      {
        entry: join(functionsDirname, 'handleQrCode/handler.ts'),
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        environment: {
          [Environments.tableName]: table.tableName,
        },
        memorySize: 256,
        timeout: Duration.seconds(20),
        runtime: Runtime.NODEJS_16_X,
        handler: 'default',
      }
    );
    const createQrcodeHandler = new NodejsFunction(
      this,
      'createQrcodeHandler',
      {
        entry: join(functionsDirname, 'createQrCode/handler.ts'),
        bundling: {
          minify: true,
          externalModules: ['aws-sdk'],
        },
        environment: {
          [Environments.tableName]: table.tableName,
        },
        memorySize: 256,
        timeout: Duration.seconds(20),
        runtime: Runtime.NODEJS_16_X,
        handler: 'default',
      }
    );

    // grant privileges to lambda functions
    table.grantReadData(handleQrcodeHandler);
    table.grantWriteData(createQrcodeHandler);

    // add endpoints to api
    restApi.root
      .addResource('{code}')
      .addMethod(HttpMethods.GET, new LambdaIntegration(handleQrcodeHandler));
    restApi.root
      .addResource('qr')
      .addMethod(HttpMethods.POST, new LambdaIntegration(createQrcodeHandler));
  }
}
