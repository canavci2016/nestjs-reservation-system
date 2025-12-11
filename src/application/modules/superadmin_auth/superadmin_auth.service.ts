import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SuperAdmin } from 'src/database/entities/super-admin.entity';
import { SignInByEmailAndPassword } from './interfaces/sign-by-email-password.interface';
import { JwtService } from 'src/core/modules/token/services/jwt.service';

@Injectable()
export class SuperAdminAuthService {
  constructor(
    @InjectRepository(SuperAdmin)
    private repository: Repository<SuperAdmin>,
    private readonly jwtService: JwtService,
  ) {}

  findAll() {
    return this.repository.find();
  }

  findOne(payload: Partial<SuperAdmin>) {
    return this.repository.findOneBy(payload);
  }

  async save(payload: Partial<SuperAdmin>) {
    if (payload.password) {
      payload.password = await this.generateToken(payload.password);
    }
    return this.repository.save(payload);
  }

  async signInByEmailAndPassword(
    field: SignInByEmailAndPassword,
  ): Promise<{ access_token: string }> {
    const user = await this.findOne({
      userName: field.userName,
    });
    if (!user) {
      throw new NotFoundException();
    }
    const result = await bcrypt.compare(field.password, user?.password);

    if (!result) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.userName };
    return {
      access_token: await this.jwtService.getToken(payload),
    };
  }

  async updateById(id: string, payload: Partial<SuperAdmin>) {
    if (payload.password) {
      payload.password = await this.generateToken(payload.password);
    }

    return await this.repository
      .createQueryBuilder()
      .update(SuperAdmin)
      .set(payload)
      .where('id = :id', { id })
      .execute();
  }

  async deleteById(id: string) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(SuperAdmin)
      .where('id = :id', { id })
      .execute();

    return result;
  }

  generateToken(password: string) {
    return bcrypt.hash(password, 10);
  }
}
