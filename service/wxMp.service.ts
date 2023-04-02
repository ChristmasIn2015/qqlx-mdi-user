import { Injectable } from "@nestjs/common";
import { ENUM_ERROR_CODE } from "qqlx-core";

import { UserDao } from "dao/user.dao";
import { UserWeChatDao } from "dao/wechat.dao";
import { UserService } from "./user.service";

@Injectable()
export class WxMpService {
    constructor(
        //
        private readonly UserDao: UserDao,
        private readonly UserWeChatDao: UserWeChatDao,
        private readonly UserService: UserService
    ) {}

    /** 根据小程序授权码，获取对应授权信息 */
    async getUnionId(clientCode: string): Promise<string> {
        const AppId = this.UserService.CONFIG_JSON_FILE_JSON.ZQSY_MP_APPID;
        const AppSecret = this.UserService.CONFIG_JSON_FILE_JSON.ZQSY_MP_APPSECRET;
        const mp_url = `https://api.weixin.qq.com/sns/jscode2session?appid=${AppId}&secret=${AppSecret}&js_code=${clientCode}&grant_type=authorization_code`;

        const mp_info = await fetch(mp_url);
        const autho: {
            session_key: string;
            openid: string;
            unionid: string;
        } = await mp_info.json();
        if (autho?.unionid === undefined) throw ENUM_ERROR_CODE.MESS_REMOTE_WECHAT;

        return autho.unionid;
    }

    /** 根据小程序授权码，获取手机号 */
    async getPhone(clientCode: string): Promise<string> {
        const AppId = this.UserService.CONFIG_JSON_FILE_JSON.ZQSY_MP_APPID;
        const AppSecret = this.UserService.CONFIG_JSON_FILE_JSON.ZQSY_MP_APPSECRET;
        const info = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${AppId}&secret=${AppSecret}`);
        const token_info = await info.json();

        const phone_remote = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${token_info.access_token}`;
        const remote = await fetch(phone_remote, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: clientCode }),
        });
        const result: { errcode: number; phone_info: { purePhoneNumber: string } } = await remote.json();
        if (result.errcode !== 0) throw ENUM_ERROR_CODE.MESS_REMOTE_WECHAT;

        const phone = result.phone_info.purePhoneNumber;
        const vaild = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(phone);
        if (!vaild) throw ENUM_ERROR_CODE.MESS_REMOTE_WECHAT;

        return phone;
    }
}
