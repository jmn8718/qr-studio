#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Domain } from './stacks';
import { IEnvParameters, Regions } from '../types';
import { PublicApi } from './stacks/publicApi';
import { Database } from './stacks/database';

const app = new cdk.App();

const { account, region, domainName }: IEnvParameters = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: Regions.EU,
  domainName: app.node.tryGetContext('DOMAIN_NAME'),
};

new Domain(app, 'domain', {
  env: {
    account,
    region,
  },
  domainName,
  subdomains: [],
});

const database = new Database(app, 'database');
new PublicApi(app, 'publicApi', {
  table: database.table,
});
