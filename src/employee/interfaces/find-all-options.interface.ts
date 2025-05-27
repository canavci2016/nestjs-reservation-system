import { Pagination } from 'src/pagination/interfaces/pagination.interface';

export interface FindAllOptions {
  companyId?: string;
  pagination?: Pagination;
  order?: Record<string, string>;
  isActive?: boolean;
}
