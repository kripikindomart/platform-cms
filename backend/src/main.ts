import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('app.corsOrigin', '*'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get<string>('app.env')}`);
}

bootstrap();
