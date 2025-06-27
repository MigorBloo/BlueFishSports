#!/bin/bash

# Set environment variables
export NODE_ENV=production
export PATH=$PATH:/usr/local/bin

# Load environment variables from .env.production
source /home/ssm-user/bluefish-sports-platform/server/.env.production

# Create backups directory if it doesn't exist
mkdir -p /home/ssm-user/bluefish-sports-platform/server/backups

# Run the backup script
cd /home/ssm-user/bluefish-sports-platform/server
node src/scripts/backup.js

# Clean up old backups (keep last 7 days)
find /home/ssm-user/bluefish-sports-platform/server/backups -type f -mtime +7 -delete 