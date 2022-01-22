import { Construct } from 'constructs'

import { Stack, StackProps, Duration } from 'aws-cdk-lib'
import { ContainerImage } from 'aws-cdk-lib/aws-ecs'
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns'

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiService = this.defineAlbFargateService(this)
    apiService.targetGroup.enableCookieStickiness(Duration.days(1))
  }

  private defineAlbFargateService(scope: Construct): ApplicationLoadBalancedFargateService {
    return new ApplicationLoadBalancedFargateService(scope, 'RowmaConnectionManager', {
      taskImageOptions: {
        image: ContainerImage.fromRegistry("rowma/rowma"),
        containerPort: 3000,
        enableLogging: true,
      },
      memoryLimitMiB: 512,
      desiredCount: 1,
      cpu: 256,
      assignPublicIp: true,
      publicLoadBalancer: true,
      listenerPort: 80,
    });
  }
}
