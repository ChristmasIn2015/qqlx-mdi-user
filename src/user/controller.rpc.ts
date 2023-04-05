import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";

import { UserInfo } from "qqlx-core";
import { getUserInfoDto, getUserInfoRes, getUserInfoListDto, getUserInfoListRes, ToResponse } from "qqlx-sdk";

import { UserDao } from "dao/user";
import { UserWeChatDao } from "dao/wechat";
import { UserService } from "src/user/service";

@Controller()
export class LogRemote {
    constructor(
        //
        private readonly UserService: UserService
    ) {}

    @MessagePattern("getUserInfo") // 需要客户端 send 并返回值
    @ToResponse()
    async getUserInfo(dto: getUserInfoDto) {
        const userInfo = await this.UserService.getUserInfo({ jwtString: dto.jwtString });
        return userInfo;
    }

    @MessagePattern("getUserInfoList") // 需要客户端 send 并返回值
    @ToResponse()
    async getUserInfoList(dto: getUserInfoListDto) {
        const list = await this.UserService.getUserInfoList(dto.userIds);
        return list;
    }
}
