const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const HITS_KEY = 'klippen_hits';

export default async function handler(req, res) {
  const secret = process.env.LOGS_SECRET;

  if (!secret || req.query.key !== secret) {
    res.status(404).end();
    return;
  }

  if (!KV_URL || !KV_TOKEN) {
    res.status(500).json({ error: 'KV not configured yet' });
    return;
  }

  const r = await fetch(`${KV_URL}/lrange/${HITS_KEY}/0/-1`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  const data = await r.json();
  const hits = (data.result || []).map(s => {
    try { return JSON.parse(s); } catch { return s; }
  });

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(hits);
}
