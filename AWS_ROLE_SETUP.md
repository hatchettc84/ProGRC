# AWS Secrets Manager Role-Based Access Setup

This document explains how to configure AWS Secrets Manager with role-based access control (IAM roles) instead of hardcoded access keys.

## Overview

The application now supports **role-based access** for AWS Secrets Manager, similar to how `AwsS3ConfigService` works. This provides better security by:

- ✅ Eliminating hardcoded credentials
- ✅ Using IAM roles and policies
- ✅ Automatic credential rotation
- ✅ Fine-grained permissions
- ✅ Audit trail through CloudTrail

## Configuration Options

### Option 1: Role-Based Access (RECOMMENDED)

Set only the region and leave credentials empty:

```bash
SECRET_PROVIDER=aws
AWS_REGION=us-east-1
# No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY needed
```

### Option 2: Explicit Credentials (Local Development Only)

```bash
SECRET_PROVIDER=aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## AWS Credential Provider Chain

When no explicit credentials are provided, the AWS SDK automatically uses this chain:

1. **IAM Instance Profile** (EC2 instances)
2. **IAM Task Role** (ECS/Fargate)
3. **IAM Execution Role** (Lambda)
4. **Environment Variables** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
5. **AWS SSO/CLI Profiles** (local development)

## IAM Role Setup

### For EC2 Instances

1. **Create IAM Role:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": "ec2.amazonaws.com"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```

2. **Attach Policy:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "secretsmanager:GetSecretValue",
           "secretsmanager:DescribeSecret"
         ],
         "Resource": "arn:aws:secretsmanager:*:*:secret:APPLICATION_SECRETS*"
       }
     ]
   }
   ```

3. **Create Instance Profile:**
   ```bash
   aws iam create-instance-profile --instance-profile-name kovr-secrets-profile
   aws iam add-role-to-instance-profile --instance-profile-name kovr-secrets-profile --role-name kovr-secrets-role
   ```

4. **Attach to EC2 Instance:**
   ```bash
   aws ec2 associate-iam-instance-profile --instance-id i-1234567890abcdef0 --iam-instance-profile Name=kovr-secrets-profile
   ```

### For ECS/Fargate

1. **Create Task Role:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": "ecs-tasks.amazonaws.com"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```

2. **Update Task Definition:**
   ```json
   {
     "taskRoleArn": "arn:aws:iam::123456789012:role/kovr-secrets-role",
     "containerDefinitions": [
       {
         "name": "kovr-bff",
         "environment": [
           {
             "name": "SECRET_PROVIDER",
             "value": "aws"
           },
           {
             "name": "AWS_REGION",
             "value": "us-east-1"
           }
         ]
       }
     ]
   }
   ```

### For Lambda Functions

1. **Create Execution Role:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": "lambda.amazonaws.com"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```

2. **Attach Policies:**
   - `AWSLambdaBasicExecutionRole` (AWS managed)
   - Custom secrets policy (see above)

## Secret Structure

Your `APPLICATION_SECRETS` secret should contain a JSON object:

```json
{
  "POSTGRES_HOST": "prod-db.example.com",
  "POSTGRES_PASSWORD": "secure-password",
  "OPENAI_API_KEY": "sk-...",
  "COGNITO_CLIENT_ID": "abc123",
  "SES_SMTP_PASSWORD": "smtp-password"
}
```

## Logging and Monitoring

The application logs will show:
- ✅ Whether role-based access is being used
- ✅ Number of secrets loaded
- ✅ Any connection issues

Example log output:
```json
{
  "level": "info",
  "message": "Loaded secrets from AWS Secrets Manager",
  "secretName": "APPLICATION_SECRETS",
  "loadedCount": 12,
  "skippedCount": 3,
  "useRoleBasedAccess": true
}
```

## Best Practices

1. **Use least privilege principle** - Only grant access to specific secrets
2. **Use resource-based policies** - Restrict access by ARN
3. **Enable CloudTrail** - Monitor secret access
4. **Regular rotation** - Use AWS Secrets Manager rotation features
5. **Environment separation** - Use different secrets for dev/staging/prod

## Troubleshooting

### Common Issues

1. **AccessDenied Error:**
   - Check IAM role permissions
   - Verify secret exists and name is correct
   - Ensure region matches

2. **Role Not Found:**
   - Verify instance profile is attached
   - Check ECS task role configuration
   - Confirm Lambda execution role

3. **Connection Timeout:**
   - Check VPC endpoints if using private subnets
   - Verify security group rules
   - Confirm network connectivity

### Testing Role Access

```bash
# Test from EC2/ECS container
aws secretsmanager get-secret-value --secret-id APPLICATION_SECRETS --region us-east-1

# Expected output shows the secret value
```

## Migration from Access Keys

1. **Create and attach IAM role** (see above)
2. **Update environment variables:**
   ```bash
   # Remove these
   # AWS_ACCESS_KEY_ID=
   # AWS_SECRET_ACCESS_KEY=
   
   # Keep these
   SECRET_PROVIDER=aws
   AWS_REGION=us-east-1
   ```
3. **Restart application**
4. **Verify logs show role-based access**
5. **Remove old access keys from AWS console**

The application will automatically detect and use role-based access when no explicit credentials are provided. 