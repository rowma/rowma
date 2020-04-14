# Terraform
```
> terraform --version
Terraform v0.12.24
```

Deployment

```
$ TF_VAR_aws_access_key_id=xxxxxx TF_VAR_aws_secret_access_key=xxxxx terraform apply
```

## Prepare
You have to create an IAM role named `ecsTaskExecutionRole` to run terraform plan. It has to attache `AmazonECSTaskExecutionRolePolicy` to the policy.

In addition, you have to create a CloudWatch log group named rowma-connection-manager.
