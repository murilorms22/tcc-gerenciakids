import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { json, urlencoded } from 'express';
import { AppModule } from '../src/app.module';

const expressApp = express();
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function bootstrapServerless() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));

    const configuredOrigins = (
      process.env.CORS_ORIGIN || 'http://localhost:5173'
    )
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        if (
          configuredOrigins.includes('*') ||
          configuredOrigins.includes(cleanOrigin) ||
          cleanOrigin === 'http://localhost:5173' ||
          cleanOrigin === 'http://127.0.0.1:5173' ||
          cleanOrigin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    isInitialized = true;
  })();

  return initPromise;
}

export default async function handler(req: any, res: any) {
  await bootstrapServerless();
  return expressApp(req, res);
}

