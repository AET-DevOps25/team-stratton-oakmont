# Deployment Scripts

This directory contains automation scripts for deploying and managing the TUM Study Planner infrastructure on AWS Academy.

## 📁 Scripts Overview

| Script                           | Purpose                           | Usage                                      |
| -------------------------------- | --------------------------------- | ------------------------------------------ |
| `deploy.sh`                      | Complete deployment automation    | `./scripts/deploy.sh`                     |
| `destroy.sh`                     | Clean infrastructure teardown     | `./scripts/destroy.sh`                    |
| `start-program-catalog-service.sh` | Start program catalog service     | `./scripts/start-program-catalog-service.sh` |
| `start-study-plan-service.sh`    | Start study plan service          | `./scripts/start-study-plan-service.sh`   |
| `start-ai-advisor-service.sh`    | Start AI advisor service          | `./scripts/start-ai-advisor-service.sh`   |
| `start-user-auth-service.sh`     | Start user authentication service | `./scripts/start-user-auth-service.sh`    |

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

## 🖥️ Local Development

For local development, you can start individual backend services using the service startup scripts:

```bash
# Start program catalog service (localhost:8080)
./scripts/start-program-catalog-service.sh

# Start study plan service (localhost:8081) - new terminal
./scripts/start-study-plan-service.sh

# Start AI advisor service (localhost:8082) - new terminal
./scripts/start-ai-advisor-service.sh

# Start user auth service (localhost:8083) - new terminal
./scripts/start-user-auth-service.sh
```

These scripts automatically load environment variables from the `.env` file and start the corresponding Spring Boot services using Gradle.

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
