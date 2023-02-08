"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./http-exception.filter");
async function bootstrap() {
    const logger = new common_1.ConsoleLogger();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('/api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    await app.listen(3000);
    logger.log(`Taco App is running in [::]:3000`, 'NestApplication');
}
bootstrap();
//# sourceMappingURL=main.js.map