const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const HITS_KEY = 'klippen_hits';

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

  if (KV_URL && KV_TOKEN) {
    const url = `${KV_URL}/lpush/${HITS_KEY}/${encodeURIComponent(JSON.stringify(hit))}`;
    await fetch(url, { headers: { Authorization: `Bearer ${KV_TOKEN}` } }).catch(() => {});
  }

  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
}
