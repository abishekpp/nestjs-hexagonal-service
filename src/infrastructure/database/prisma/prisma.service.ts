import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured');
    }

    const pool = new Pool({
      connectionString: databaseUrl,

      // Optional
      max: Number(configService.get<string>('DATABASE_POOL_MAX') ?? 10),
      idleTimeoutMillis: Number(configService.get<string>('DATABASE_IDLE_TIMEOUT_MS') ?? 30000),
      connectionTimeoutMillis: Number(
        configService.get<string>('DATABASE_CONNECTION_TIMEOUT_MS') ?? 10000,
      ),
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established.');
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.warn(`Closing database connection. Signal: ${signal ?? 'unknown'}`);

    await this.$disconnect();

    this.logger.log('Database connection closed.');
  }
}
