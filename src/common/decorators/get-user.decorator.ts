import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetReqContextUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user || (request as any).raw?.user;

    const userWithIp = { ...user, ip: request.ip };
    return data ? userWithIp?.[data] : userWithIp;
  },
);
