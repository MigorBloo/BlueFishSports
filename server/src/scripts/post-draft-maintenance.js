const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const pool = require('../src/config/database');
const logger = require('../config/logger');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function cleanupTemporaryFiles() {
  try {
    // List all objects in the temporary directory
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: 'temp/'
    });

    const { Contents } = await s3Client.send(listCommand);

    if (Contents && Contents.length > 0) {
      // Delete all temporary files
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
          Objects: Contents.map(obj => ({ Key: obj.Key }))
        }
      });

      await s3Client.send(deleteCommand);
      console.log(`Deleted ${Contents.length} temporary files`);
    }
  } catch (error) {
    console.error('Error cleaning up temporary files:', error);
    throw error;
  }
}

async function optimizeDatabase() {
  try {
    // Vacuum analyze all tables
    await pool.query('VACUUM ANALYZE');
    console.log('Database optimization completed');
  } catch (error) {
    console.error('Error optimizing database:', error);
    throw error;
  }
}

async function runMaintenance() {
  try {
    console.log('Starting post-draft maintenance...');
    
    await cleanupTemporaryFiles();
    await optimizeDatabase();
    
    console.log('Post-draft maintenance completed successfully');
  } catch (error) {
    console.error('Post-draft maintenance failed:', error);
    process.exit(1);
  }
}

// Run maintenance
runMaintenance(); 