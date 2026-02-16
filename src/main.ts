import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { configureApp } from './common/app.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  app.enableCors({ origin: true, credentials: true });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
  app.useStaticAssets(join(process.cwd(), 'frontend'), {
    prefix: '/app',
  });

  app.getHttpAdapter().get('/', (_req: unknown, res: { json: (body: unknown) => void }) => {
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
