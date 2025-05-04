import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { SaveBlog } from './interfaces/save-blog.interface';
import { Pagination } from 'src/pagination/interfaces/pagination.interface';

interface FindAllOptions {
  companyId?: string;
  pagination?: Pagination;
}

interface FindAllOptions {
  companyId?: string;
  pagination?: Pagination;
  order?: Record<string, string>;
}

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
    return this.repository.save(payload);
  }
}
