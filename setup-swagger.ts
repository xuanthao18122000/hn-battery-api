import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getEnv } from 'src/configs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Web API')
    .setDescription('The Web API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(getEnv<string>('API_URL') + '/api')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('api/docs', app, document);
}
