export default () => ({
  port: parseInt(process.env.BACKEND_PORT ?? '4000', 10),

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  mlService: {
    /** URL ML service FastAPI. Gunakan nama service Docker jika dalam container. */
    url: process.env.ML_SERVICE_URL ?? 'http://localhost:8000',
    /** Timeout request ke ML service dalam milidetik */
    timeoutMs: parseInt(process.env.ML_SERVICE_TIMEOUT_MS ?? '5000', 10),
  },

  aws: {
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    s3BucketName: process.env.S3_BUCKET_NAME ?? '',
    cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN ?? '',
  },
});
