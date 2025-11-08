import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaveBlog } from './interfaces/save-blog.interface';
import { Pagination } from 'src/core/modules/pagination/interfaces/pagination.interface';
import { Announcement } from 'src/database/entities/announcement.entity';
import { FileUploadService } from 'src/shared/modules/file-upload/file-upload.service';

interface FindAllOptions {
  companyId?: string;
  pagination?: Pagination;
  order?: Record<string, string>;
}

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private repository: Repository<Announcement>,
    private readonly fileUploadService: FileUploadService,
  ) {
    console.log('BlogService initialized');
  }

  findOne(payload: Partial<Announcement>): Promise<Announcement | null> {
    return this.repository.findOneBy(payload);
  }

  findAll(options: FindAllOptions | null = null): Promise<Announcement[]> {
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

  async save(payload: SaveBlog): Promise<Announcement> {
    const uploadedPhotoUrl = await this.fileUploadService.announcement(
      payload.photo,
      {
        companyId: payload.companyId,
      },
    );
    payload.photoUrl = uploadedPhotoUrl || payload.photoUrl;
    return this.repository.save(payload);
  }

  async deleteById(payload: Pick<Announcement, 'id' | 'companyId'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Announcement)
      .where(payload)
      .execute();

    return result;
  }

  async updateById(
    condition: Pick<Announcement, 'id' | 'companyId'>,
    payload: Partial<SaveBlog>,
  ) {
    const uploadedPhotoUrl = await this.fileUploadService.announcement(
      payload.photo,
      {
        companyId: condition.companyId,
      },
    );

    if (uploadedPhotoUrl) {
      payload.photoUrl = uploadedPhotoUrl;
    }

    return await this.repository
      .createQueryBuilder()
      .update(Announcement)
      .set(payload)
      .where(condition)
      .execute();
  }
}
