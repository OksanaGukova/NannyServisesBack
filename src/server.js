// src/server.js

import express from 'express';
import pino from 'pino-http';
import cors from 'cors';



import { getEnvVar } from './utils/getEnvVar.js';
import { getAllNannyes, getNannyById } from './services/nannyes.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());


  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/nannys', async (req, res) => {
 const nannyes = await getAllNannyes();

    res.status(200).json({
      data: nannyes,
    });
  });

  app.get('/nannys/:nannyId', async (req, res) => {

        const { nannyId } = req.params;
    const nanny = await getNannyById(nannyId);

    // Відповідь, якщо контакт не знайдено
	if (!nanny) {
	  res.status(404).json({
		  message: 'Nanny not found'
	  });
	  return;
	}

	// Відповідь, якщо контакт знайдено
    res.status(200).json({
      data: nanny,
    });

});

     app.use((req, res, next) => {
       // If no route was matched, send 404
       if (!req.route) {
         res.status(404).json({ message: 'Not found' });
       } else {
         next();
       }
     });

  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong',
      error: err.message,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
