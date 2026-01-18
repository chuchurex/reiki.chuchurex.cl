# Deployment Guide

## Overview

This guide covers deploying your static website to a production server using SSH/rsync.

## Prerequisites

- Node.js v20+ installed
- SSH access to your hosting server
- Domain configured with DNS pointing to your server

## Configuration

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Domain Configuration
DOMAIN=your-site.com

# SSH/RSYNC Deployment
UPLOAD_HOST=your-server.com          # Server IP or hostname
UPLOAD_PORT=22                        # SSH port (often 65002 for Hostinger)
UPLOAD_USER=your-username             # SSH username
UPLOAD_PASS=your-password             # SSH password
UPLOAD_DIR=/path/to/public_html/      # Remote directory path

# Cloudflare (optional)
CF_API_KEY=your-api-key
CF_EMAIL=your-email
CF_ZONE_ID=your-zone-id
```

> ⚠️ **Important**: The `.env` file contains sensitive credentials and **should never be committed to git**. This file is already protected in `.gitignore`.

### 2. Install sshpass (if using password authentication)

**macOS:**
```bash
brew install hudochenkov/sshpass/sshpass
```

**Linux:**
```bash
sudo apt-get install sshpass
```

### 3. Test SSH Connection

```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

## Deployment Process

### Option 1: Automated Deploy (Recommended)

```bash
npm run publish
```

This will:
1. Build the static site (`npm run build`)
2. Deploy via rsync (`node scripts/deploy.js`)
3. (Optional) Purge Cloudflare cache if configured

### Option 2: Manual Steps

```bash
# 1. Build
npm run build

# 2. Deploy
node scripts/deploy.js

# 3. Purge cache (optional)
node scripts/purge-cloudflare.js --all
```

## Deployment Methods

### SSH/RSYNC (Current Default)

The `scripts/deploy.js` uses rsync over SSH for efficient file transfers:

```javascript
const rsyncCmd = `sshpass -p "${password}" rsync -avz --delete -e "ssh -p ${port} -o StrictHostKeyChecking=no" ${localDir} ${user}@${host}:${remoteDir}`;
```

**Advantages:**
- Only uploads changed files
- Preserves file permissions
- Fast and efficient
- Works with most hosting providers

### Alternative: SSH Keys (More Secure)

1. Generate SSH key:
```bash
ssh-keygen -t ed25519 -C "your@email.com"
```

2. Copy to server:
```bash
ssh-copy-id -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

3. Modify `scripts/deploy.js` to use keys instead of password

## Server Structure

### Typical Hosting Structure

```
domains/
└── your-site.com/
    └── public_html/          ← UPLOAD_DIR
        ├── index.html
        ├── ch1/
        ├── ch2/
        ├── css/
        └── fonts/
```

### For Subdomains

```bash
# Subdomain
UPLOAD_DIR=/domains/subdomain.your-site.com/public_html/

# Subdirectory
UPLOAD_DIR=/domains/your-site.com/public_html/book/
```

## Verification

### 1. Check Files Deployed

```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
ls -la ${UPLOAD_DIR}
```

### 2. Test Site Access

```bash
curl https://your-site.com
```

### 3. Check DNS

```bash
dig your-site.com
# or
nslookup your-site.com
```

## Common Issues

### Error: Connection Refused

**Cause**: Wrong SSH port or firewall blocking

**Solution**:
```bash
# Test with telnet
telnet ${UPLOAD_HOST} ${UPLOAD_PORT}

# Verify port in hosting panel
```

### Error: Permission Denied

**Cause**: Wrong credentials or path

**Solution**:
```bash
# Test SSH login manually
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}

# Check remote directory exists
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la ${UPLOAD_DIR}"
```

### Files Not Updating

**Cause**: Wrong remote directory path

**Solution**:
```bash
# Verify actual path on server
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "pwd"

# Check file timestamps
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -lt ${UPLOAD_DIR} | head -20"
```

### Cloudflare Cache Not Clearing

**Cause**: Need to purge cache after deploy

**Solution**:
```bash
# Purge all cache
node scripts/purge-cloudflare.js --all

# Or wait 5 minutes for Cloudflare to detect changes
```

## Security Best Practices

### 1. SSH Authentication

**Recommended**: Use SSH keys instead of passwords for better security.

```bash
# Generate key (if you don't have one)
ssh-keygen -t ed25519 -C "your@email.com"

# Copy to server
ssh-copy-id -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

Then modify `scripts/deploy.js` to use keys instead of `sshpass`.

### 2. File Permissions

Set appropriate permissions on the server:

```bash
# Files: read/write for owner, read-only for others
find ${UPLOAD_DIR} -type f -exec chmod 644 {} \;

# Directories: read/write/execute for owner, read/execute for others
find ${UPLOAD_DIR} -type d -exec chmod 755 {} \;
```

### 3. Environment Variables in CI/CD

For automated deployment, use secret managers:
- **GitHub Actions**: GitHub Secrets
- **GitLab CI**: CI/CD Variables
- **Local**: `.env` file (never commit)

## Continuous Deployment (CI/CD)

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        env:
          UPLOAD_HOST: ${{ secrets.UPLOAD_HOST }}
          UPLOAD_PORT: ${{ secrets.UPLOAD_PORT }}
          UPLOAD_USER: ${{ secrets.UPLOAD_USER }}
          UPLOAD_PASS: ${{ secrets.UPLOAD_PASS }}
          UPLOAD_DIR: ${{ secrets.UPLOAD_DIR }}
        run: |
          sudo apt-get install -y sshpass
          node scripts/deploy.js
```

Configure secrets in GitHub repository settings.

## Next Steps

- [Cloudflare Cache Management](./CLOUDFLARE.md)
- [Main Documentation](./README.md)

---

For issues or questions, open an issue on GitHub.
