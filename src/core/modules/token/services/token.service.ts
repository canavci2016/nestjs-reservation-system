import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import TokenEntity from '../entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private repository: Repository<TokenEntity>,
    private jwtService: JwtService,
  ) {
    console.log('CompanyService initialized');
  }

  async save(
    payload: Partial<Pick<TokenEntity, 'startAt' | 'content'>> &
      Required<
        Pick<TokenEntity, 'owner_id' | 'owner_type' | 'action' | 'expiresAt'>
      >,
  ) {
    if (!payload.content) {
      payload.content = await this.jwtService.getToken({
        owner_type: payload.owner_type,
        owner_id: payload.owner_id,
        action: payload.action,
        timestamp: Date.now(),
      });
    }

    return this.repository.save(payload);
  }

  async revoke(token: string) {
    const model = await this.getActive(token);
    if (!model) {
      throw new NotFoundException('token isnot available');
    }

    const update = await this.updateBy({ content: token }, { revoked: true });

    return Boolean(update.affected);
  }

  getActive(token: string) {
    return this.findOne({ content: token, revoked: false });
  }

  findOne(payload: FindOptionsWhere<TokenEntity>) {
    return this.repository.findOneBy(payload);
  }

  async updateBy(
    condition: Partial<Pick<TokenEntity, 'id' | 'content'>>,
    payload: Partial<TokenEntity>,
  ) {
    return await this.repository
      .createQueryBuilder()
      .update(TokenEntity)
      .set(payload)
      .where(condition)
      .execute();
  }

  async deleteBy(condition: Pick<TokenEntity, 'id' | 'content'>) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(TokenEntity)
      .softDelete()
      .where(condition)
      .execute();

    return result;
  }
}
