import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema, UserDao } from "dao/user.dao";
import { UserWeChat, UserWeChatSchema, UserWeChatDao } from "dao/wechat.dao";

import { LogRpc } from "service/log.rpc";
import { UserService } from "service/user.service";
import { WxClientService } from "service/wxClient.service";
import { WxMpService } from "service/wxMp.service";
import { UserController } from "./app.controller";

@Module({
    imports: [
        MongooseModule.forRoot("mongodb://127.0.0.1:27017/qqlx"),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserWeChat.name, schema: UserWeChatSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [UserDao, UserWeChatDao, LogRpc, UserService, WxClientService, WxMpService],
})
export class AppModule {}
