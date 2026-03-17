import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '@salestrack/storage';

const PRESIGNED_EXPIRES_IN = 3600; // 1 hour

@Injectable()
export class StorageAppService {
  private storage: StorageService;

  constructor(private readonly configService: ConfigService) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET', 'sales-track-academy-dev');
    this.storage = new StorageService(bucket);
  }

  async getUploadUrl(
    fileName: string,
    contentType: string,
    entityType: string,
    entityId: string,
  ) {
    const key = `${entityType}/${entityId}/${Date.now()}-${fileName}`;
    const uploadUrl = await this.storage.getUploadUrl(key, contentType, PRESIGNED_EXPIRES_IN);
    return { uploadUrl, key, expiresIn: PRESIGNED_EXPIRES_IN };
  }

  async getDownloadUrl(key: string, inline?: boolean) {
    const url = await this.storage.getDownloadUrl(key, PRESIGNED_EXPIRES_IN, inline);
    return { url, expiresIn: PRESIGNED_EXPIRES_IN };
  }

  async confirmUpload(key: string) {
    const exists = await this.storage.fileExists(key);
    return { confirmed: exists, key };
  }

  async getFile(key: string): Promise<{ body: Buffer; contentType: string }> {
    return this.storage.getFile(key);
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.storage.uploadFile(key, body, contentType);
  }

  async deleteFile(key: string) {
    await this.storage.deleteFile(key);
  }
}
