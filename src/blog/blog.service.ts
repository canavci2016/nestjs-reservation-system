import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { SaveBlog } from './interfaces/save-blog.interface';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private repository: Repository<Blog>,
  ) {
    console.log('BlogService initialized');
  }

  findOne(payload: Partial<Blog>): Promise<Blog | null> {
    return this.repository.findOneBy(payload);
  }

  findAll(options: Record<string, string> | null = null): Promise<Blog[]> {
    const whereQuery = {};

    if (options?.companyId) {
      whereQuery['companyId'] = options.companyId;
    }

    return this.repository.find({ where: whereQuery });
  }

  async save(payload: SaveBlog): Promise<Blog> {
    return this.repository.save(payload);
  }
}
