import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";

import { PORT_REST_USER, HOST_MID_USER, PORT_MID_USER } from "qqlx-sdk";

import { GlobalExceptionFilter } from "global/exception.filter";
import { GlobalResponseInterceptor } from "global/response.interceptor";
import { LogRpc } from "rpc/log";

async function bootstrap() {
    // 创建基于 TCP 协议的微服务
    const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.TCP,
        options: { host: HOST_MID_USER, port: PORT_MID_USER },
    });
    await microservice.listen();

    // 启动 RESTful API
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new GlobalExceptionFilter(new LogRpc()));
    app.useGlobalInterceptors(new GlobalResponseInterceptor(new LogRpc()));
    await app.listen(PORT_REST_USER);
}
bootstrap();
