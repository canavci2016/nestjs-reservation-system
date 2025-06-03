import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/database/entities/token.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { JwtService } from './jwt.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private repository: Repository<Token>,
    private jwtService: JwtService,
  ) {
    console.log('CompanyService initialized');
  }

  async save(
    payload: Partial<Pick<Token, 'startAt' | 'content'>> &
      Required<Pick<Token, 'owner_id' | 'owner_type' | 'action' | 'expiresAt'>>,
  ) {
    if (!payload.content) {
      payload.content = await this.jwtService.signAsync({
        owner_type: payload.owner_type,
        owner_id: payload.owner_id,
        action: payload.action,
        timestamp: Date.now(),
      });
    }

    return this.repository.save(payload);
  }

  findAll(options: Partial<Token> | null = null) {
    const query = {};
    const whereQuery = options;

    query['where'] = whereQuery;

    query['order'] = { createdAt: 'desc' };

    return this.repository.find(query);
  }

  findOne(payload: FindOptionsWhere<Token>) {
    return this.repository.findOneBy(payload);
  }

  async updateById(id: string, payload: Partial<Token>) {
    return await this.repository
      .createQueryBuilder()
      .update(Token)
      .set(payload)
      .where('id = :id', { id })
      .execute();
  }

  async deleteById(condition: Pick<Token, 'id'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Token)
      .softDelete()
      .where(condition)
      .execute();

    return result;
  }
}
