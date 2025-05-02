import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveUser } from './interfaces/save-user.interface';

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

  findOne(payload: Partial<User>): Promise<User | null> {
    return this.repository.findOneBy(payload);
  }

  async save(payload: SaveUser): Promise<User> {
    return this.repository.save(payload);
  }
}
