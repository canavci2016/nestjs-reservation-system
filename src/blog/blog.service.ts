import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveBlog } from './interfaces/save-blog.interface';
import { FindAllOptions } from './interfaces/find-all-options.interface';
import { Blog } from 'src/database/entities/blog.entity';
import { FileUpload } from './interfaces/file-upload.interface';
import * as Stream from 'stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class BlogService {
  s3Client: S3Client;

  constructor(
    @InjectRepository(Blog)
    private repository: Repository<Blog>,
  ) {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
    console.log('BlogService initialized');
  }

  findOne(payload: Partial<Blog>): Promise<Blog | null> {
    return this.repository.findOneBy(payload);
  }

  findAll(options: FindAllOptions | null = null): Promise<Blog[]> {
    const query = {};
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    query['where'] = whereQuery;

    const take = options?.pagination?.length || 10;
    const page = options?.pagination?.number || 1;
    const skip = (page - 1) * take;
    query['take'] = take;
    query['skip'] = skip;
    query['order'] = { createdAt: 'desc' };

    return this.repository.find(query);
  }

  async save(payload: SaveBlog): Promise<Blog> {
    let photoUrl = payload.photoUrl;
    if (typeof payload.photo != 'undefined' || payload.photo != null) {
      const imageFile: FileUpload = await payload.photo;
      const fileName = `${payload.companyId}_${Date.now()}_${imageFile.filename}`;

      const filePath = await this.uploadFileStream(
        imageFile.createReadStream,
        fileName,
      );
      photoUrl = filePath.Location || photoUrl;
    }
    payload.photoUrl = photoUrl;
    return this.repository.save(payload);
  }

  async deleteById(condition: Pick<Blog, 'id' | 'companyId'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Blog)
      .where(condition)
      .execute();

    return result;
  }

  async updateById(
    condition: Pick<Blog, 'id' | 'companyId'>,
    payload: Partial<Blog>,
  ) {
    return await this.repository
      .createQueryBuilder()
      .update(Blog)
      .set(payload)
      .where(condition)
      .execute();
  }

  async uploadFileStream(readStream: () => Stream, filePath: string) {
    const inStream = readStream();
    const pass = new Stream.PassThrough();
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filePath,
        Body: pass,
        ContentType: 'image/png',
        ACL: 'public-read',
      },
    });
    inStream.pipe(pass);

    const result = await upload.done();
    return result;
  }
}
