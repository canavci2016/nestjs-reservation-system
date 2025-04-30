import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class SimpleResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}
