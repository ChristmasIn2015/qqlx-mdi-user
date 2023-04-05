import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { UserWeChat as QQLXUserWeChat } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class UserWeChat implements QQLXUserWeChat {
    @Prop({ default: "", required: true })
    userId: string;
    @Prop({ default: "" })
    unionId: string;
    @Prop({ default: "" })
    nickname: string;
    @Prop({ default: "" })
    avator: string;

    @Prop({ required: true })
    _id: string;
    @Prop({ default: 0 })
    timeCreate: number;
    @Prop({ default: 0 })
    timeUpdate: number;
    @Prop({ default: "" })
    timeCreateString: string;
    @Prop({ default: "" })
    timeUpdateString: string;
}

export const UserWeChatSchema = SchemaFactory.createForClass(UserWeChat).set("versionKey", false);

@Injectable()
export class UserWeChatDao extends MongooseDao<UserWeChat> {
    constructor(@InjectModel(UserWeChat.name) private model: Model<UserWeChat>) {
        super(model);
    }
}
