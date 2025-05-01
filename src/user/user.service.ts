import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveUser } from './interfaces/save-user.interface';
import { FindUserByUserNameAndPassword } from './interfaces/find-user-by-username-password.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {
    console.log('CompanyService initialized');
  }

  getHello(): string {
    return 'Hello World!';
  }

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async findByUserNameAndPassword(
    payload: FindUserByUserNameAndPassword,
  ): Promise<User | null> {
    const user = await this.repository.findOneBy(payload);

    if (!user || user?.password !== payload.password) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async save(payload: SaveUser): Promise<User> {
    return this.repository.save(payload);
  }
}
