import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CompteID = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: Record<string, any> }>();
    if (data) {
      return request.user?.[data] as string;
    }
    return request.user;
  },
);
