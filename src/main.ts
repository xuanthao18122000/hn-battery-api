import 'src/database/extensions/select-typeorm.custom';
import 'src/database/extensions/repository-typeorm.custom';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, NextFunction, Response, urlencoded } from 'express';
import { ErrorLoggerService } from './services/error-logger.service';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AllExceptionsFilter } from './filters/exception.filter';
import { getEnv } from './configs';
import { setupSwagger } from 'setup-swagger';
import { RequestIdMiddleware, RequestWithId } from './middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const errorLogger = app.get(ErrorLoggerService);

  process.on('uncaughtException', (error: Error) => {
    errorLogger.logUncaughtException(error);
    process.exit(1);
  });

  process.on(
    'unhandledRejection',
    (reason: unknown, promise: Promise<unknown>) => {
      errorLogger.logUnhandledRejection(reason, promise);
    },
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const requestIdMiddleware = new RequestIdMiddleware();

  app.use((req: RequestWithId, res: Response, next: NextFunction) =>
    requestIdMiddleware.use(req, res, next),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  const port = getEnv<number>('PORT');
  const nodeEnv = getEnv<string>('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  if (!isProduction) {
    setupSwagger(app);
  }

  await app.listen(port, () => {
    console.table({
      [`${nodeEnv}`]: {
        database: getEnv<string>('DB_TYPE'),
        host: getEnv<string>('DB_HOST'),
        port: port,
        swagger: !isProduction ? 'api/docs' : '',
      },
    });
  });
}
void bootstrap();
