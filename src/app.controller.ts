import { Controller, Get, Post, Body, Patch, SetMetadata, UseGuards } from "@nestjs/common";
import { sign } from "jsonwebtoken";

import { PATH_USER_WECHAT, User, UserWeChat, UserInfo, ENUM_LOG } from "qqlx-core";
import { postUserWeChatDto, postUserWeChatRes, getUserWeChatDto, getUserWeChatRes, patchUserWeChatDto, patchUserWeChatRes } from "qqlx-core";
import { UserDTO } from "qqlx-sdk";

import { UserGuard } from "global/user.guard";
import { UserDao } from "dao/user.dao";
import { UserWeChatDao } from "dao/wechat.dao";
import { WxClientService } from "service/wxClient.service";
import { WxMpService } from "service/wxMp.service";
import { UserService } from "service/user.service";

import { LogRpc } from "service/log.rpc";

@Controller(PATH_USER_WECHAT)
@UseGuards(UserGuard)
export class UserController {
    constructor(
        private readonly LogRpc: LogRpc,
        private readonly UserDao: UserDao,
        private readonly UserWeChatDao: UserWeChatDao,
        private readonly WxClientService: WxClientService,
        private readonly WxMpService: WxMpService,
        private readonly UserService: UserService
    ) {
        this.LogRpc.log(ENUM_LOG.ALL, "/user", "123");
    }

    @Post()
    async login(@Body("dto") dto: postUserWeChatDto): Promise<postUserWeChatRes> {
        const jwtKey = this.UserService.CONFIG_JSON_FILE_JSON.JWT_KEY;
        const code = dto.wechatResponseCode;

        // 根据小程序授权码登陆
        if (dto.isWxmp) {
            const unionId = await this.WxMpService.getUnionId(code);

            const userWeChat: UserWeChat = await this.UserWeChatDao.findOne(unionId, "unionId");
            const isUserExist = !!userWeChat;

            // 用户已存在
            if (isUserExist) {
                const user = await this.UserDao.findOne(userWeChat.userId);
                const wechat = await this.UserWeChatDao.findOne(userWeChat.userId, "userId");
                return {
                    userId: wechat.userId,
                    phone: user.phone,
                    nickname: wechat.nickname,
                    avator: wechat.avator,
                    jwt: user.jwt, // 不做抢登逻辑
                };
            }
            // 用户不存在
            else {
                const jwtString = sign({ unionId, time: Date.now() }, jwtKey);
                const userCreated: User = await this.UserDao.create({ jwt: jwtString });
                const wechat: UserWeChat = await this.UserWeChatDao.create({
                    userId: userCreated._id,
                    unionId: unionId,
                    nickname: "微信用户",
                    avator: "",
                });
                return {
                    userId: wechat.userId,
                    phone: userCreated.phone,
                    nickname: wechat.nickname,
                    avator: wechat.avator,
                    jwt: jwtString, // 新的用户令牌,
                };
            }
        }
        // 根据客户端授权码登陆
        else {
            const unionInfo = await this.WxClientService.getUnionInfo(code);
            const userInfo = await this.WxClientService.getUserInfo(unionInfo.access_token, unionInfo.openid);

            const jwtString = sign({ unionId: unionInfo.unionid, time: Date.now() }, jwtKey);
            const userWeChat: UserWeChat = await this.UserWeChatDao.findOne(unionInfo.unionid, "unionId");
            const isUserExist = !!userWeChat;

            // 用户已存在：需要更新令牌
            if (isUserExist) {
                const userUpdated = await this.UserDao.updateOne(userWeChat.userId, { jwt: jwtString });
                const wechat: UserWeChat = await this.UserWeChatDao.updateOne(userWeChat._id, { avator: userInfo.headimgurl });
                return {
                    userId: wechat.userId,
                    phone: userUpdated.phone,
                    nickname: wechat.nickname,
                    avator: wechat.avator,
                    jwt: jwtString,
                };
            }
            // 用户不存在
            else {
                const userCreated: User = await this.UserDao.create({ jwt: jwtString });
                const wechat: UserWeChat = await this.UserWeChatDao.create({
                    userId: userCreated._id,
                    unionId: unionInfo.unionid,
                    nickname: userInfo.nickname,
                    avator: userInfo.headimgurl,
                    jwt: jwtString,
                });
                return {
                    userId: wechat.userId,
                    phone: userCreated.phone,
                    nickname: wechat.nickname,
                    avator: wechat.avator,
                    jwt: jwtString,
                };
            }
        }
    }

    @Post("/get")
    @SetMetadata("Logined", null)
    async getUserWeChat(@Body("dto") dto: getUserWeChatDto, @Body("UserDTO") UserDTO: UserDTO): Promise<getUserWeChatRes> {
        return UserDTO.userInfo;
    }

    @Patch()
    @SetMetadata("Logined", null)
    async patchUser(@Body("dto") dto: patchUserWeChatDto, @Body("UserDTO") UserDTO: UserDTO) {
        // 修改昵称或是头像
        const match = { userId: UserDTO.userInfo.userId };
        const updater = { nickname: dto.nickname, avator: dto.avator };
        await this.UserWeChatDao.updateMany(match, updater);

        // 修改手机号
        if (dto.clientPhoneCode) {
            const phone = await this.WxMpService.getPhone(dto.clientPhoneCode);
            await this.UserDao.updateOne(UserDTO.userInfo.userId, { phone });
        }
    }
}
