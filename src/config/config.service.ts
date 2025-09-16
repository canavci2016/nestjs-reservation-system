import { Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor(@Inject('CONFIG_OPTIONS') private opts: Record<string, string>) {
    const folder = opts.folder || './';

    const filePath = `.env`;
    const envFile = path.resolve(__dirname, '../../', folder, filePath);
    this.envConfig = dotenv.parse(fs.readFileSync(envFile));

    console.log(this.envConfig);
  }

  get(key: string): string {
    return this.envConfig[key];
  }
}
