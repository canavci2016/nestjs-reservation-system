import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveBlog } from './interfaces/save-blog.interface';
import { FindAllOptions } from './interfaces/find-all-options.interface';
import { Blog } from '../../../database/entities/blog.entity';
import { FileUploadService } from '../../../shared/modules/file-upload/file-upload.service';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(Blog)
    private repository: Repository<Blog>,
    private readonly fileUploadService: FileUploadService,
  ) {
    this.logger.log('BlogService initialized');
  }

  findOne(payload: Partial<Omit<Blog, 'company'>>) {
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
    query['order'] = { updatedAt: 'desc' };

    return this.repository.find(query);
  }

  async save(payload: SaveBlog): Promise<Blog> {
    const uploadedPhotoUrl = await this.fileUploadService.blog(payload.photo, {
      companyId: payload.companyId,
    });

    payload.photoUrl = uploadedPhotoUrl || payload.photoUrl;
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
    payload: Partial<SaveBlog>,
  ) {
    const uploadedPhotoUrl = await this.fileUploadService.blog(payload.photo, {
      companyId: condition.companyId,
    });

    if (uploadedPhotoUrl) {
      payload.photoUrl = uploadedPhotoUrl;
    }

    return await this.repository
      .createQueryBuilder()
      .update(Blog)
      .set(payload)
      .where(condition)
      .execute();
  }
}
