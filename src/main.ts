import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PROD_DOMAIN_ENABLE_CORS = configService.get('PROD_DOMAIN_ENABLE_CORS');
  const LOCAL_DOMAIN_ENABLE_CORS = configService.get(
    'LOCAL_DOMAIN_ENABLE_CORS',
  );

  app.enableCors({
    origin: [PROD_DOMAIN_ENABLE_CORS, LOCAL_DOMAIN_ENABLE_CORS],
  });

  await app.listen(3000);
}
bootstrap();
