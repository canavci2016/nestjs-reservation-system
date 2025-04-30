import { Module } from '@nestjs/common';
import { SimpleResolver } from './simple.resolver';

@Module({
  providers: [SimpleResolver],
})
export class RecipesModule {}
