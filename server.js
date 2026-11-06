import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import wineRoutes from './routes/wines.js';

const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000;

const app = express();

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} ${req.method} ${req.path}`);
  next();
}

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.json({ message: 'Château Fakra wine API', wines: '/api/wines' });
});

app.use('/api/wines', wineRoutes);

// no route matched
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// error handler, needs the 4 parameters so express knows what it is
app.use((err, req, res, next) => {
  // bad json from express.json() ends up here
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

if (!dbUri) {
  console.error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// connect first, then listen
try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}
