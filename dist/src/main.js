"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const app_config_1 = require("./common/app.config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    (0, app_config_1.configureApp)(app);
    app.enableCors({ origin: true, credentials: true });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads',
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'frontend'), {
        prefix: '/app',
    });
    app.getHttpAdapter().get('/', (_req, res) => {
        res.json({
            service: 'ferretto-installations-backend',
            status: 'ok',
            health: '/api/health',
            apiPrefix: '/api',
        });
    });
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map