import { Injectable } from "@nestjs/common";

import { ENUM_ERROR_CODE } from "qqlx-core";

import { UserDao } from "dao/user.dao";
import { UserWeChatDao } from "dao/wechat.dao";
import { UserService } from "./user.service";

@Injectable()
export class WxClientService {
    constructor(
        //
        private readonly UserDao: UserDao,
        private readonly UserWeChatDao: UserWeChatDao,
        private readonly UserService: UserService
    ) {}

    /** 根据微信客户端授权码，获取对应授权信息 */
    async getUnionInfo(code: string): Promise<{
        unionid: string;
        openid: string;
        refresh_token: string;
        access_token: string;
        expires_in: number;
        scope: string;
    }> {
        const AppId = this.UserService.CONFIG_JSON_FILE_JSON.ZQSY_OPEN_APPID;
        const AppSecret = this.UserService.CONFIG_JSON_FILE_JSON.ZQSY_OPEN_APPSECRET;
        const open_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${AppId}&secret=${AppSecret}&code=${code}&grant_type=authorization_code`;
        const wx_autho = await fetch(open_url);
        const autho = await wx_autho.json();
        if (autho?.unionid === undefined) throw ENUM_ERROR_CODE.MESS_REMOTE_WECHAT;

        return autho;
    }

    /** 根据微信客户端授权码，获取对应用户信息 */
    async getUserInfo(
        token: string,
        openId: string
    ): Promise<{
        unionid: string;
        openid: string;
        headimgurl: string;
        nickname: string;
    }> {
        const wx_user = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${token}&openid=${openId}`);
        const userInfo = await wx_user.json();
        if (!userInfo) throw ENUM_ERROR_CODE.MESS_REMOTE_WECHAT;
        return userInfo;
    }
}
