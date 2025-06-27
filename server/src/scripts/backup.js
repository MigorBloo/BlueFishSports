const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('../config/logger');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${timestamp}.sql`;
  const backupPath = path.join(__dirname, '..', 'backups', backupFileName);

  try {
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, '..', 'backups'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'backups'));
    }

    // Create database backup
    const { stdout, stderr } = await execAsync(
      `pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -d ${process.env.DB_NAME} > ${backupPath}`
    );

    if (stderr) {
      logger.error('Backup error:', stderr);
      throw new Error('Backup failed');
    }

    // Upload to S3
    const fileStream = fs.createReadStream(backupPath);
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BACKUP_BUCKET,
      Key: `database/${backupFileName}`,
      Body: fileStream
    });

    await s3Client.send(command);
    logger.info(`Backup completed and uploaded to S3: ${backupFileName}`);

    // Clean up local backup file
    fs.unlinkSync(backupPath);
  } catch (error) {
    logger.error('Backup failed:', error);
    throw error;
  }
}

// Run backup
backupDatabase().then(() => process.exit(0)).catch((error) => {
  logger.error('Backup process failed:', error);
  process.exit(1);
}); 