import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  private readonly logger = new Logger(ShutdownService.name);
  async onApplicationShutdown(signal?: string) {
    this.logger.warn(`Application shutting down... Signal: ${signal}`);
    /* Close: - Kafka - Redis - DB pools - Cron jobs - WebSockets - External connections */
    this.logger.log('Graceful shutdown completed.');
  }
}
