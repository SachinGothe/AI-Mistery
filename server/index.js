import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cases from './routes/cases.js';
import { logger, rateLimit } from './middleware/rateLimit.js';

import dns from 'node:dns';

// Fix Node.js Windows c-ares issue where DNS defaults to 127.0.0.1 and fails SRV queries
try {
  dns.setDefaultResultOrder('ipv4first');
  const servers = dns.getServers();
  if (!servers.length || servers.every(s => s.startsWith('127.'))) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
} catch (e) {
  // Non-fatal if setting servers fails
}

const app = express();
app.set('trust proxy', 1);
app.use(logger);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api', rateLimit(120));
app.use('/api/cases', cases);
app.use((err, req, res, next) => {
  console.error(err.cause || err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Server error' });
});

await mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT || 5000, () => console.log('Server running'));
