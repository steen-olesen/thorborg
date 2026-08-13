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
  const { ver = '', deck = '', slide = '', total = '', label = '' } = req.query;

  const hit = {
    t: new Date().toISOString(),
    ver,
    deck,
    slide,
    total,
    label,
    ref: req.headers['referer'] || '',
    ua: req.headers['user-agent'] || '',
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
  };

  console.log(JSON.stringify(hit));

  if (process.env.dmb_REDIS_URL) {
    try {
      const client = await getClient();
      await client.lPush(HITS_KEY, JSON.stringify(hit));
    } catch (err) {
      console.error('Failed to write hit to Redis', err);
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
}
