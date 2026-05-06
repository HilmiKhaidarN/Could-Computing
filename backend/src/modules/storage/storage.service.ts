import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontDomain: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('aws.region') ?? 'ap-southeast-1';
    this.bucket = this.config.get<string>('aws.s3BucketName') ?? '';
    this.cloudfrontDomain = this.config.get<string>('aws.cloudfrontDomain') ?? '';

    this.s3 = new S3Client({ region });
  }

  /**
   * Upload file ke S3 dan kembalikan URL CloudFront.
   * File disimpan di folder `reports/` dengan nama unik berbasis UUID.
   */
  async uploadReportImage(
    file: Express.Multer.File,
    reportId: string,
  ): Promise<string> {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3_BUCKET_NAME belum dikonfigurasi');
    }

    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const key = `reports/${reportId}/${randomUUID()}${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Tidak menggunakan ACL public-read — akses melalui CloudFront saja
        }),
      );

      this.logger.log(`File uploaded to S3: s3://${this.bucket}/${key}`);

      // Kembalikan URL CloudFront (bukan URL S3 langsung)
      return this.buildCloudfrontUrl(key);
    } catch (err) {
      this.logger.error(`Gagal upload ke S3: ${err}`);
      throw new InternalServerErrorException('Gagal mengupload file ke S3');
    }
  }

  /**
   * Hapus file dari S3 berdasarkan URL CloudFront.
   */
  async deleteFile(cloudfrontUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(cloudfrontUrl);
    if (!key) return;

    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (err) {
      this.logger.warn(`Gagal menghapus file dari S3: ${err}`);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Bangun URL CloudFront dari S3 key.
   * Format: https://<cloudfront-domain>/<key>
   */
  private buildCloudfrontUrl(key: string): string {
    if (this.cloudfrontDomain) {
      const domain = this.cloudfrontDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `https://${domain}/${key}`;
    }
    // Fallback ke S3 URL jika CloudFront belum dikonfigurasi (development)
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  /**
   * Ekstrak S3 key dari URL CloudFront atau S3.
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      // Hapus leading slash
      return parsed.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  }
}
