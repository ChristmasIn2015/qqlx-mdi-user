import { randomUUID } from "crypto";

import { CanActivate, Injectable, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { UserDTO } from "qqlx-sdk";

import { UserDao } from "dao/user";
import { UserWeChatDao } from "dao/wechat";
import { UserService } from "src/user/service";

@Injectable()
export class UserGuard implements CanActivate {
    constructor(
        //
        private readonly reflector: Reflector,
        private readonly UserService: UserService
    ) {}

    async canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        const authorization = request.header("Authorization");
        const userInfo = await this.UserService.getUserInfo({ jwtString: authorization });

        const UserDTO: UserDTO = { chain: randomUUID(), userInfo };
        request.body.UserDTO = UserDTO;
        return true;
    }
}
