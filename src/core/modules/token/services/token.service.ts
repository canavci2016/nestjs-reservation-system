import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import { Token } from '../../../../database/entities/token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private repository: Repository<Token>,
    private jwtService: JwtService,
  ) { }

  async save(
    payload: Partial<Pick<Token, 'startAt' | 'content'>> &
      Required<Pick<Token, 'owner_id' | 'owner_type' | 'action' | 'expiresAt'>>,
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

  findOne(payload: FindOptionsWhere<Token>) {
    return this.repository.findOneBy(payload);
  }

  async updateBy(
    condition: Partial<Pick<Token, 'id' | 'content'>>,
    payload: Partial<Token>,
  ) {
    return await this.repository
      .createQueryBuilder()
      .update(Token)
      .set(payload)
      .where(condition)
      .execute();
  }

  async deleteBy(condition: Pick<Token, 'id' | 'content'>) {
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
