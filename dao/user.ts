import { Injectable } from "@nestjs/common";
import { Schema, Prop, SchemaFactory, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User as QQLXUser } from "qqlx-core";
import { MongooseDao } from "qqlx-sdk";

@Schema()
export class User implements QQLXUser {
    @Prop({ default: "" })
    phone: string;
    @Prop({ default: "" })
    jwt: string;

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

export const UserSchema = SchemaFactory.createForClass(User).set("versionKey", false);

@Injectable()
export class UserDao extends MongooseDao<User> {
    constructor(@InjectModel(User.name) private model: Model<User>) {
        super(model);
    }
}
