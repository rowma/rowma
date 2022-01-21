import { Construct } from 'constructs'

import { Stack, StackProps, Duration } from 'aws-cdk-lib'
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs'
import { ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.defineAlbFargateService(this)
  }

  private defineAlb(scope: Construct) {
    const vpc = new Vpc(scope, 'VPC');
    const lb = new ApplicationLoadBalancer(scope, 'lb', { vpc });
    const listener = lb.addListener('listener', { port: 80 });
    listener.addTargets('target', {
      port: 80,
      stickinessCookieDuration: Duration.days(1),
    });
    return lb
  }

  private defineAlbFargateService(scope: Construct) {
    const lb = this.defineAlb(scope)

    new ApplicationLoadBalancedFargateService(scope, 'RowmaConnectionManager', {
      taskImageOptions: {
        image: ContainerImage.fromRegistry('rowma/rowma'),
      },
      publicLoadBalancer: true,
      loadBalancer: lb
    });
  }
}
