# 🚀 AWS Deployment Setup Guide

Panduan lengkap untuk deploy AegisOps ke AWS menggunakan ECS Fargate, RDS, S3, dan CloudFront.

## 📋 Prerequisites

- AWS Account dengan billing enabled
- AWS CLI installed dan configured
- Docker installed
- GitHub repository dengan Actions enabled

## 🏗️ Architecture Overview

```
Internet → CloudFront → ALB → ECS (Fargate) → RDS (Private)
                         ↓
                        S3
```

## 1️⃣ Setup VPC & Networking

### Create VPC

```bash
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=aegisops-vpc}]'

# Note the VPC ID
export VPC_ID=vpc-xxxxx
```

### Create Subnets

```bash
# Public Subnet A (untuk ALB & ECS)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-southeast-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=aegisops-public-a}]'

export PUBLIC_SUBNET_A=subnet-xxxxx

# Public Subnet B (Multi-AZ)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone ap-southeast-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=aegisops-public-b}]'

export PUBLIC_SUBNET_B=subnet-xxxxx

# Private Subnet A (untuk RDS)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.3.0/24 \
  --availability-zone ap-southeast-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=aegisops-private-a}]'

export PRIVATE_SUBNET_A=subnet-xxxxx

# Private Subnet B (RDS Multi-AZ)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.4.0/24 \
  --availability-zone ap-southeast-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=aegisops-private-b}]'

export PRIVATE_SUBNET_B=subnet-xxxxx
```

### Create Internet Gateway

```bash
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=aegisops-igw}]'

export IGW_ID=igw-xxxxx

aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID
```

### Create Route Tables

```bash
# Public route table
aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=aegisops-public-rt}]'

export PUBLIC_RT=rtb-xxxxx

# Add route to internet
aws ec2 create-route \
  --route-table-id $PUBLIC_RT \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID

# Associate with public subnets
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_A --route-table-id $PUBLIC_RT
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_B --route-table-id $PUBLIC_RT
```

## 2️⃣ Setup Security Groups

### ALB Security Group

```bash
aws ec2 create-security-group \
  --group-name aegisops-alb-sg \
  --description "Security group for ALB" \
  --vpc-id $VPC_ID

export ALB_SG=sg-xxxxx

# Allow HTTP/HTTPS from internet
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

### ECS Security Group

```bash
aws ec2 create-security-group \
  --group-name aegisops-ecs-sg \
  --description "Security group for ECS tasks" \
  --vpc-id $VPC_ID

export ECS_SG=sg-xxxxx

# Allow traffic from ALB
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp --port 3000 --source-group $ALB_SG

aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp --port 4000 --source-group $ALB_SG

aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG \
  --protocol tcp --port 8000 --source-group $ALB_SG
```

### RDS Security Group

```bash
aws ec2 create-security-group \
  --group-name aegisops-rds-sg \
  --description "Security group for RDS" \
  --vpc-id $VPC_ID

export RDS_SG=sg-xxxxx

# Allow PostgreSQL from ECS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp --port 5432 --source-group $ECS_SG
```

## 3️⃣ Setup RDS PostgreSQL

### Create DB Subnet Group

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name aegisops-db-subnet \
  --db-subnet-group-description "Subnet group for AegisOps RDS" \
  --subnet-ids $PRIVATE_SUBNET_A $PRIVATE_SUBNET_B
```

### Create RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier aegisops-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username aegisops \
  --master-user-password 'YourStrongPassword123!' \
  --allocated-storage 20 \
  --vpc-security-group-ids $RDS_SG \
  --db-subnet-group-name aegisops-db-subnet \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --storage-encrypted \
  --publicly-accessible false

# Wait for creation (takes ~10 minutes)
aws rds wait db-instance-available --db-instance-identifier aegisops-db

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier aegisops-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

## 4️⃣ Setup S3 & CloudFront

### Create S3 Bucket

```bash
aws s3api create-bucket \
  --bucket aegisops-uploads-$(date +%s) \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

export S3_BUCKET=aegisops-uploads-xxxxx

# Block public access
aws s3api put-public-access-block \
  --bucket $S3_BUCKET \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket $S3_BUCKET \
  --versioning-configuration Status=Enabled
```

### Create CloudFront Distribution

```bash
# Create Origin Access Control (OAC)
aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    "Name=aegisops-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3"

export OAC_ID=xxxxx

# Create distribution (use AWS Console atau CloudFormation untuk config lengkap)
```

### Update S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::aegisops-uploads-xxxxx/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

## 5️⃣ Setup ECR Repositories

```bash
# Backend
aws ecr create-repository \
  --repository-name aegisops-backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Frontend
aws ecr create-repository \
  --repository-name aegisops-frontend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# ML Service
aws ecr create-repository \
  --repository-name aegisops-ml \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

## 6️⃣ Setup ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name aegisops-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1,base=1
```

## 7️⃣ Setup Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name aegisops-alb \
  --subnets $PUBLIC_SUBNET_A $PUBLIC_SUBNET_B \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application

export ALB_ARN=arn:aws:elasticloadbalancing:...

# Create Target Groups
aws elbv2 create-target-group \
  --name aegisops-backend-tg \
  --protocol HTTP \
  --port 4000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /health

export BACKEND_TG_ARN=arn:aws:elasticloadbalancing:...

aws elbv2 create-target-group \
  --name aegisops-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /

export FRONTEND_TG_ARN=arn:aws:elasticloadbalancing:...

# Create Listeners
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$FRONTEND_TG_ARN
```

## 8️⃣ Setup IAM Roles

### ECS Task Execution Role

```bash
# Create trust policy
cat > ecs-task-trust-policy.json << EOF
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
EOF

aws iam create-role \
  --role-name aegisops-ecs-task-execution-role \
  --assume-role-policy-document file://ecs-task-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name aegisops-ecs-task-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
  --role-name aegisops-ecs-task-execution-role \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```

### ECS Task Role (for S3 access)

```bash
cat > ecs-task-role-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::$S3_BUCKET/*"
    }
  ]
}
EOF

aws iam create-role \
  --role-name aegisops-ecs-task-role \
  --assume-role-policy-document file://ecs-task-trust-policy.json

aws iam put-role-policy \
  --role-name aegisops-ecs-task-role \
  --policy-name S3Access \
  --policy-document file://ecs-task-role-policy.json
```

## 9️⃣ Setup AWS Secrets Manager

```bash
aws secretsmanager create-secret \
  --name aegisops/production/database \
  --secret-string '{
    "username": "aegisops",
    "password": "YourStrongPassword123!",
    "host": "aegisops-db.xxxxx.ap-southeast-1.rds.amazonaws.com",
    "port": 5432,
    "database": "aegisops_db"
  }'

aws secretsmanager create-secret \
  --name aegisops/production/jwt \
  --secret-string '{
    "secret": "your-random-jwt-secret-key-here"
  }'
```

## 🔟 Setup GitHub Actions OIDC

### Create OIDC Provider

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### Create GitHub Actions Role

```bash
cat > github-actions-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:HilmiKhaidarN/Could-Computing:*"
        }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name github-actions-ecr-ecs-role \
  --assume-role-policy-document file://github-actions-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name github-actions-ecr-ecs-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name github-actions-ecr-ecs-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
```

## 1️⃣1️⃣ Configure GitHub Secrets

Di GitHub repository settings → Secrets and variables → Actions, tambahkan:

```
AWS_ACCOUNT_ID=123456789012
AWS_REGION=ap-southeast-1
NEXT_PUBLIC_API_URL=https://api.aegisops.com
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
```

## 1️⃣2️⃣ Deploy ECS Services

Gunakan task definitions di `docs/ecs-task-definitions/` dan deploy via:

```bash
# Register task definitions
aws ecs register-task-definition --cli-input-json file://docs/ecs-task-definitions/backend.json
aws ecs register-task-definition --cli-input-json file://docs/ecs-task-definitions/frontend.json
aws ecs register-task-definition --cli-input-json file://docs/ecs-task-definitions/ml-service.json

# Create services
aws ecs create-service \
  --cluster aegisops-cluster \
  --service-name aegisops-backend \
  --task-definition aegisops-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PUBLIC_SUBNET_A,$PUBLIC_SUBNET_B],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$BACKEND_TG_ARN,containerName=backend,containerPort=4000"
```

## ✅ Verification

1. Check ALB DNS:
   ```bash
   aws elbv2 describe-load-balancers --names aegisops-alb --query 'LoadBalancers[0].DNSName'
   ```

2. Test endpoints:
   ```bash
   curl http://ALB_DNS/health
   ```

3. Check ECS services:
   ```bash
   aws ecs describe-services --cluster aegisops-cluster --services aegisops-backend
   ```

## 💰 Cost Estimation

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| ECS Fargate | 3 tasks × 0.5 vCPU, 1GB RAM | ~$30 |
| RDS PostgreSQL | db.t3.micro, Multi-AZ | ~$30 |
| ALB | 1 ALB | ~$20 |
| S3 | 10GB storage, 1000 requests | ~$1 |
| CloudFront | 10GB transfer | ~$1 |
| **Total** | | **~$82/month** |

## 🔒 Security Checklist

- [ ] RDS in private subnet
- [ ] S3 bucket not public
- [ ] CloudFront OAC configured
- [ ] Secrets in Secrets Manager
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege
- [ ] CloudWatch logging enabled
- [ ] Backup retention configured

## 📚 Additional Resources

- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS Security](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
- [CloudFront + S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
