import { createClient } from 'redis';

const HITS_KEY = 'klippen_hits';
let clientPromise;

function getClient() {
  if (!clientPromise) {
    const client = createClient({ url: process.env.dmb_REDIS_URL });
    client.on('error', (err) => console.error('Redis error', err));
    clientPromise = client.connect().then(() => client);
  }
  return clientPromise;
}

export default async function handler(req, res) {
  const secret = process.env.LOGS_SECRET;

  if (!secret || req.query.key !== secret) {
    res.status(404).end();
    return;
  }

  if (!process.env.dmb_REDIS_URL) {
    res.status(500).json({ error: 'Redis not configured yet' });
    return;
  }

  try {
    const client = await getClient();
    const raw = await client.lRange(HITS_KEY, 0, -1);
    const hits = raw.map(s => {
      try { return JSON.parse(s); } catch { return s; }
    });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(hits);
  } catch (err) {
    console.error('Failed to read hits from Redis', err);
    res.status(500).json({ error: 'Failed to read from Redis' });
  }
}
