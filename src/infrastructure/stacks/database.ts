import type { ITable } from '../../types';
import type { StackProps } from 'aws-cdk-lib';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, Table as DynamoTable } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { TableAttributes } from '../../types';

export class Database extends Stack {
  public readonly table: ITable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new DynamoTable(this, 'table', {
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: TableAttributes.PK,
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: TableAttributes.TTL,
    });

    this.table = {
      streamArn: table.tableStreamArn,
      name: table.tableName,
    };
  }
}
