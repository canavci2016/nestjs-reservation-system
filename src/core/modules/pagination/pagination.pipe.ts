import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { PaginationInput } from './dto/pagination.input';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(pagination: PaginationInput, metadata: ArgumentMetadata) {
    return {
      number: pagination?.number || 1,
      length: pagination?.length || 10,
    };
  }
}
