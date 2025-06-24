# Deployment Scripts

This directory contains automation scripts for deploying and managing the TUM Study Planner infrastructure on AWS Academy.

## 📁 Scripts Overview

| Script       | Purpose                        | Usage                  |
| ------------ | ------------------------------ | ---------------------- |
| `deploy.sh`  | Complete deployment automation | `./scripts/deploy.sh`  |
| `destroy.sh` | Clean infrastructure teardown  | `./scripts/destroy.sh` |

## 🚀 Quick Start

### One-Command Deployment

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Deploy everything
./scripts/deploy.sh
```

### Clean Up Resources

```bash
# Destroy all AWS resources
./scripts/destroy.sh
```

## 📋 Prerequisites

- **AWS Academy Account** with active lab session
- **Bash shell** (macOS/Linux or WSL on Windows)
- **Required tools** installed:

  ```bash
  # Install via Homebrew (macOS)
  brew install terraform awscli ansible

  # Or via package managers on Linux
  sudo apt-get install terraform awscli ansible  # Ubuntu/Debian
  sudo yum install terraform awscli ansible      # RHEL/CentOS
  ```

## 🔧 deploy.sh - Complete Deployment

### What It Does

1. **🎓 AWS Academy Setup**

   - Prompts for AWS Academy credentials
   - Creates and manages SSH key pairs
   - Validates connectivity and permissions

2. **🏗️ Infrastructure Provisioning**

   - Runs Terraform to create EC2 instance
   - Configures security groups and networking
   - Outputs instance details

3. **⏳ Readiness Checks**

   - Waits for instance to boot completely
   - Tests SSH connectivity with retries
   - Provides diagnostic information

4. **🎭 Application Deployment**
   - Runs Ansible playbook
   - Installs Docker and dependencies
   - Builds and starts all services

## 🗑️ destroy.sh - Infrastructure Cleanup

### What It Does

1. **🛑 Graceful Service Shutdown**

   - Stops Docker containers properly
   - Prevents data corruption

2. **🏗️ Infrastructure Teardown**

   - Destroys EC2 instances and resources
   - Removes security groups and networking

3. **🔑 Key Management**

   - Deletes SSH key pairs from AWS
   - Removes local key files

4. **🧹 Local Cleanup**
   - Removes temporary files
   - Clears session data

**⚠️ Important**: Always run `./scripts/destroy.sh` before your AWS Academy lab session expires to avoid leaving orphaned resources!
