import http from 'http';
import { createApp } from './app';
import { createSocketServer } from './socket';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const bootstrap = async () => {
  // Verify DB connection
  try {
    await prisma.$connect();
    logger.info('Database connection established');
  } catch (err) {
    logger.error('Failed to connect to database', { error: err });
    process.exit(1);
  }

  // Surface email deliverability at boot: without a key, transactional
  // mail (onboarding, password reset) is silently dropped — an admin can
  // be locked out with no other signal.
  if (!process.env.RESEND_API_KEY) {
    logger.error(
      '[email] RESEND_API_KEY is not set — onboarding & password-reset emails will NOT be delivered',
      { event: 'email_disabled_no_api_key' },
    );
  }

  // PHI is stored in cleartext without this key. Acceptable for local dev;
  // an error condition in production.
  if (!process.env.PHI_ENCRYPTION_KEY) {
    const msg = '[phi-crypto] PHI_ENCRYPTION_KEY is not set — PHI columns are NOT encrypted at rest';
    if (config.NODE_ENV === 'production') logger.error(msg, { event: 'phi_encryption_disabled' });
    else logger.warn(msg, { event: 'phi_encryption_disabled' });
  }

  const app = createApp();
  const httpServer = http.createServer(app);
  createSocketServer(httpServer);

  httpServer.listen(config.PORT, () => {
    logger.info(`Meditir API running`, {
      port: config.PORT,
      env: config.NODE_ENV,
      url: `http://localhost:${config.PORT}`,
    });
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await prisma.$disconnect();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

bootstrap();
