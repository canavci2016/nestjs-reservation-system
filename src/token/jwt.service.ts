import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/database/entities/token.entity';
import { Repository } from 'typeorm';
import { JwtService as BuiltInJwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtService {
  constructor(
    @InjectRepository(Token)
    private repository: Repository<Token>,
    private readonly jwtService: BuiltInJwtService,
  ) {
    console.log('CompanyService initialized');
  }

  async signAsync(payload: any) {
    return this.jwtService.signAsync(payload);
  }

  async verifyAsync(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });
  }
}
