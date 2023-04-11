import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { User, UserSchema, UserDao } from "dao/user";
import { UserWeChat, UserWeChatSchema, UserWeChatDao } from "dao/wechat";

import { LogRemote } from "remote/log";
import { UserService } from "src/user/service";
import { WxClientService } from "src/user/service.wxClient";
import { WxMpService } from "src/user/service.wxMp";
import { UserController } from "./user/controller.rest";
import { UserRpc } from "./user/controller.rpc";

@Module({
    imports: [
        MongooseModule.forRoot("mongodb://127.0.0.1:27017/qqlx"),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserWeChat.name, schema: UserWeChatSchema },
        ]),
    ],
    controllers: [UserController, UserRpc],
    providers: [UserDao, UserWeChatDao, LogRemote, UserService, WxClientService, WxMpService],
})
export class AppModule {}
