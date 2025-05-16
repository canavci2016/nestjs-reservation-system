import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CompanyApp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx);

    const company = <ExecutionContext>context.getContext()?.req?.company_app;

    return company;
  },
);
