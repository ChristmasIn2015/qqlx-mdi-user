import { readFileSync } from "fs";
import { join } from "path";

import { Injectable } from "@nestjs/common";
import { verify } from "jsonwebtoken";
import { ENUM_ERROR_CODE, User, UserInfo, UserWeChat } from "qqlx-core";

import { UserDao } from "dao/user";
import { UserWeChatDao } from "dao/wechat";

@Injectable()
export class UserService {
    CONFIG_JSON_FILE_JSON: Record<string, any>;

    constructor(
        //
        private readonly UserDao: UserDao,
        private readonly UserWeChatDao: UserWeChatDao
    ) {
        this.initConfig();
    }

    async getUserInfo(option: { jwtString?: string; userId?: string }): Promise<UserInfo> {
        // 从jwt中翻译
        if (option.jwtString) {
            const jwtInfo = verify(option.jwtString, this.CONFIG_JSON_FILE_JSON.JWT_KEY);
            const { unionId } = jwtInfo;
            if (!unionId) throw ENUM_ERROR_CODE.UNAUTHORIZED_USER;

            const userWeChat: UserWeChat = await this.UserWeChatDao.findOne(unionId, "unionId");
            const user: User = await this.UserDao.findOne(userWeChat?.userId);
            if (!user) throw ENUM_ERROR_CODE.NOT_FOUND_USER;
            if (user.jwt !== option.jwtString) throw ENUM_ERROR_CODE.UNAUTHORIZED_USER;

            return {
                userId: user._id,
                phone: user.phone,
                nickname: userWeChat.nickname,
                avator: userWeChat.avator,
            };
        }
        // 直接翻译用户Id
        else if (option.userId) {
            const userWeChat: UserWeChat = await this.UserWeChatDao.findOne(option.userId, "userId");
            const user: User = await this.UserDao.findOne(userWeChat?.userId);
            if (!user) throw ENUM_ERROR_CODE.NOT_FOUND_USER;

            return {
                userId: user._id,
                phone: user.phone,
                nickname: userWeChat.nickname,
                avator: userWeChat.avator,
            };
        }
        // 默认
        else throw ENUM_ERROR_CODE.UNAUTHORIZED_USER;
    }

    async getUserInfoList(userIds: string[]): Promise<UserInfo[]> {
        const userWeChatList: UserWeChat[] = await this.UserWeChatDao.query({
            userId: { $in: userIds },
        });
        const userList: User[] = await this.UserDao.query({ _id: { $in: userWeChatList.map((e) => e.userId) } });

        return userList.map((user) => {
            const wechat = userWeChatList.find((e) => e.userId === user._id);
            return {
                userId: user._id,
                phone: user.phone,
                nickname: wechat?.nickname,
                avator: wechat?.nickname,
            };
        });
    }

    private initConfig() {
        const CONFIG_JSON_FILE = readFileSync(join(process.cwd(), "../qqlx-config.json"));
        this.CONFIG_JSON_FILE_JSON = JSON.parse(CONFIG_JSON_FILE.toString());
    }
}
