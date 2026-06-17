

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';

import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import router from './routers/index.js';
import cookieParser from 'cookie-parser';
import { UPLOAD_DIR } from './constans/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';




export const startServer = () => {
  const app = express();
  
  const corsOptions = {
    origin: "https://nanny-services-ivory.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  };

  app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api-docs', swaggerDocs());

app.use(pino({
  transport: { target: 'pino-pretty' },
}));

app.use(router);

// error handlers В КІНЦІ
app.use(notFoundHandler);
app.use(errorHandler);
};
