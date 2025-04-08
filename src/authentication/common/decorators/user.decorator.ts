import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    console.log('CurrentUser decorator called', data);
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: Record<string, any> }>();
    if (data) {
      return request.user?.[data] as string | undefined;
    }
    return request.user;
  },
);
