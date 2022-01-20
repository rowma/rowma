import { Stack, StackProps,Construct } from '@aws-cdk/core';

import { ContainerImage } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.defineAlbFargateService(this)
  }

  private defineAlbFargateService(scope: Construct) {
    new ApplicationLoadBalancedFargateService(scope, 'RowmaConnectionManager', {
      taskImageOptions: {
        image: ContainerImage.fromRegistry('rowma/rowma'),
      },
      publicLoadBalancer: true,
      // loadBalancer: undefined
    });
  }
}
