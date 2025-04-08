import { createParamDecorator, ExecutionContext } from '@nestjs/common';
interface User {
  [key: string]: string | number | object | undefined;
}
export const User = createParamDecorator(
  (data: string | number | object | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    const user: User | undefined = request.user;

    if (user && (typeof data === 'string' || typeof data === 'number')) {
      return user[data];
    }
    return user;
  },
);
