import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from "@nestjs/common";
import { map } from "rxjs/operators";

import { Response } from "qqlx-cdk";
import { ENUM_LOG, MAP_ENUM_ERROR_CODE } from "qqlx-core";
import { UserDTO } from "qqlx-sdk";

import { LogRpc } from "rpc/log";

@Injectable()
export class GlobalResponseInterceptor<T> implements NestInterceptor {
    constructor(
        //
        private readonly LogRpc: LogRpc
    ) {}

    intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const path = request.path;
        const UserDTO: UserDTO = request.body.UserDTO;

        return next.handle().pipe(
            map((data) => {
                const response: Response<T> = {
                    code: 200,
                    data: data ?? null,
                    message: "成功",
                };
                this.LogRpc.log(ENUM_LOG.ALL, path, UserDTO.chain); // async
                return response;
            })
        );
    }
}
