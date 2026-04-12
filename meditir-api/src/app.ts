import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

// Route modules
import authRoutes from './modules/auth/auth.routes';
import hospitalsRoutes from './modules/hospitals/hospitals.routes';
import doctorsRoutes from './modules/doctors/doctors.routes';
import patientsRoutes from './modules/patients/patients.routes';
import sessionsRoutes from './modules/sessions/sessions.routes';
import transcriptionRoutes from './modules/transcription/transcription.routes';
import soapNotesRoutes from './modules/soap-notes/soap-notes.routes';
import ehrExtractionsRoutes from './modules/ehr-extractions/ehr-extractions.routes';
import patientSummariesRoutes from './modules/patient-summaries/patient-summaries.routes';
import noteChatRoutes from './modules/note-chat/note-chat.routes';
import ttsRoutes from './modules/tts/tts.routes';
import adminRoutes from './modules/admin/admin.routes';

export const createApp = () => {
  const app = express();

  // Trust Railway's proxy
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  // CORS
  app.use(
    cors({
      origin: config.ALLOWED_ORIGINS.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Hospital-Slug'],
    })
  );

  app.use(cookieParser(config.COOKIE_SECRET));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (config.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(generalLimiter);

  // Health check — also exposes which routes are mounted so we can verify deploys
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      routes: [
        'auth',
        'hospitals',
        'doctors',
        'patients',
        'sessions',
        'transcriptions',
        'soap-notes',
        'ehr-extractions',
        'patient-summaries',
        'note-chat',
        'tts',
        'admin',
      ],
      commit: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
    });
  });

  // API routes
  const base = `/api/${config.API_VERSION}`;
  app.use(`${base}/auth`, authRoutes);
  app.use(`${base}/hospitals`, hospitalsRoutes);
  app.use(`${base}/doctors`, doctorsRoutes);
  app.use(`${base}/patients`, patientsRoutes);
  app.use(`${base}/sessions`, sessionsRoutes);
  app.use(`${base}/transcriptions`, transcriptionRoutes);
  app.use(`${base}/soap-notes`, soapNotesRoutes);
  app.use(`${base}/ehr-extractions`, ehrExtractionsRoutes);
  app.use(`${base}/patient-summaries`, patientSummariesRoutes);
  app.use(`${base}/note-chat`, noteChatRoutes);
  app.use(`${base}/tts`, ttsRoutes);
  app.use(`${base}/admin`, adminRoutes);

  // 404 handler
  app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.originalUrl} — no matching route`);
    res.status(404).json({ status: 'error', message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
