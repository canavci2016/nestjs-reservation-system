import { Pagination } from 'src/pagination/interfaces/pagination.interface';

export interface FindAllOptions {
  q?: string;
  companyId?: string;
  pagination?: Pagination;
  order?: Record<string, string>;
}
