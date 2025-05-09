import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from 'src/database/entities/device.entity';

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private repository: Repository<Device>,
  ) {
    console.log('DeviceService initialized');
  }

  findOne(payload: Partial<Device>): Promise<Device | null> {
    return this.repository.findOneBy(payload);
  }

  async updateOrInsertByToken(
    payload: Required<Pick<Device, 'token'>> & Partial<Device>,
  ) {
    const tokenObj = await this.repository.findOneBy({ token: payload.token });
    if (tokenObj) {
      return await this.repository
        .createQueryBuilder()
        .update(Device)
        .set(payload)
        .where('token = :token', { token: tokenObj.token })
        .execute();
    }

    return this.repository.save(payload);
  }
}
