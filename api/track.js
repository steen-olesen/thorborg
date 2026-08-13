export default function handler(req, res) {
  const { ver = '', deck = '', slide = '', total = '', label = '' } = req.query;

  console.log(JSON.stringify({
    t: new Date().toISOString(),
    ver,
    deck,
    slide,
    total,
    label,
    ref: req.headers['referer'] || '',
    ua: req.headers['user-agent'] || '',
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
  }));

  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
}
