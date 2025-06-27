const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file
  }
}).single('profileLogo');

// Generate a unique filename
const generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname);
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  return `${uniqueSuffix}${ext}`;
};

// Get public URL for S3 object
const getPublicUrl = (key) => {
  // Use CloudFront URL instead of direct S3 URL
  return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
};

// Upload file to S3
const uploadToS3 = async (file, folder) => {
  try {
    console.log('Starting S3 upload:', {
      bucket: process.env.S3_BUCKET_NAME,
      region: process.env.AWS_REGION,
      folder,
      fileSize: file.size,
      fileType: file.mimetype
    });

    const key = `${folder}/${generateUniqueFilename(file.originalname)}`;
    console.log('Generated S3 key:', key);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000'  // Cache for 1 year
    });

    console.log('Sending PutObjectCommand to S3...');
    await s3Client.send(command);

    // Return CloudFront URL
    const publicUrl = getPublicUrl(key);
    console.log('Successfully uploaded to S3. CloudFront URL:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to S3:', {
      error: error.message,
      code: error.code,
      bucket: process.env.S3_BUCKET_NAME,
      region: process.env.AWS_REGION
    });
    throw error;
  }
};

// Get signed URL for S3 object
const getSignedUrlForS3 = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', {
      error: error.message,
      key,
      bucket: process.env.S3_BUCKET_NAME
    });
    throw error;
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToS3,
  getSignedUrlForS3,
  getPublicUrl,
  deleteFromS3
}; 