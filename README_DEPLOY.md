# ProGRC Platform Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the ProGRC platform to production.

## Deployment Options

### 🚀 Quick Start (VPS/Local Development)
**Time**: 15-30 minutes | **Cost**: $0 (local) or $13-25/month (VPS)

For developers, testing, or small deployments:
- **[Quick Start Guide](QUICK_START.md)** - Get running in minutes
- **[VPS Deployment Guide](DEPLOYMENT_VPS.md)** - Full VPS setup

### ☁️ AWS Production Deployment
**Time**: 2-4 hours | **Cost**: $106-199/month (optimized)

For production, compliance, or scale:
- **[AWS Deployment Guide](DEPLOYMENT_AWS.md)** - Complete AWS setup with cost optimization

## Architecture Comparison

| Component | AWS Deployment | VPS Deployment |
|-----------|---------------|----------------|
| **Backend** | ECS Fargate (managed) | Docker Compose |
| **Database** | RDS PostgreSQL (managed) | PostgreSQL container |
| **Cache** | ElastiCache Redis | Redis container |
| **Queue** | SQS (managed) | Local processing |
| **Frontend** | S3 + CloudFront | Nginx static files |
| **Secrets** | AWS Secrets Manager | Environment variables |
| **Load Balancer** | ALB | Nginx reverse proxy |

⚠️ **Important**: AWS and VPS environments are functionally equivalent but not identical. Do not assume behavior in VPS exactly matches AWS (especially async jobs, SQS, IAM roles).

## Why Fargate vs EC2?

The AWS deployment uses different ECS launch types for different services:

- **Backend API (Fargate)**: Serverless containers with predictable load patterns. No server management, auto-scaling, and cost-effective for API workloads.
- **DS Service (EC2)**: Long-running compute-heavy tasks (ML processing). Requires more control, potential GPU access, and cost-effective for compute-intensive workloads.

## Prerequisites

### For AWS Deployment
- AWS Account with admin access
- AWS CLI installed and configured
- Docker installed locally
- Node.js 18+ and npm installed
- Domain name (recommended)

### For VPS Deployment
- VPS with Ubuntu 20.04+ (4GB RAM, 2 vCPU minimum)
- Root or sudo access
- Domain name (optional, for SSL)

## Cost Estimates

### AWS (Optimized)
- **Monthly**: $106-199
- **Breakdown**: 
  - ECS Fargate: $30-50
  - RDS PostgreSQL: $15-30
  - ElastiCache Redis: $12-15
  - ALB: $16-20
  - S3/CloudFront: $6-20
  - Data Transfer: $5-20
  - Other services: $22-44

### VPS
- **Monthly**: $13-25 (VPS hosting)
- **Breakdown**: 
  - VPS: $12-24
  - Domain: $1/month

## Security Considerations

🔐 **Critical Security Notes**:
- Never commit `.env` files or paste secrets into shared terminals
- Use AWS Secrets Manager for production (AWS) or secure environment files (VPS)
- Rotate JWT keys and database passwords regularly
- Enable firewall rules and restrict database access
- Use TLS/SSL for all connections
- Follow least privilege principle for IAM roles

## Quick Links

- [Quick Start (15 min)](QUICK_START.md) - Fast local/VPS setup
- [AWS Deployment (2-4 hours)](DEPLOYMENT_AWS.md) - Complete AWS production setup
- [VPS Deployment (1-2 hours)](DEPLOYMENT_VPS.md) - Complete VPS production setup

## Next Steps

1. **Choose your deployment path** based on your needs
2. **Follow the appropriate guide** step-by-step
3. **Complete the Production Readiness Checklist** before going live
4. **Set up monitoring and backups** after deployment

## Support

For deployment issues:
- Check the troubleshooting sections in each guide
- Review service logs
- Verify environment configuration
- Check health endpoints: `/api/v1/health`

---

**Related Documentation**:
- [Frontend Serving Configuration](FRONTEND_SERVING.md)
- [SPA Routing Setup](SPA_ROUTING_SETUP.md)
- [AWS Role Setup](AWS_ROLE_SETUP.md)

