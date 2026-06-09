import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRouter from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY is not set. Add it to your .env file.');
  process.exit(1);
}

if (!process.env.ALLOWED_ORIGIN) {
  console.error('❌ ALLOWED_ORIGIN is not set. Add it to your .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8080;
const distPath = join(__dirname, '..', 'dist');

app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json({ limit: '5mb' }));
app.use('/api', chatRouter);
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Voyager production server running on http://localhost:${PORT}`);
});
