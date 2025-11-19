import { Pagination } from 'src/core/modules/pagination/interfaces/pagination.interface';

export interface FindAllOptions {
  companyId?: string;
  pagination?: Pagination;
  order?: Record<string, string>;
  isActive?: boolean;
}
