// Vercel serverless entry. Wraps the Express app; no app.listen in serverless.
// All routes are rewritten here via vercel.json; req.url keeps the original path.
import { createApp } from '../src/app.js';
import { connectDb } from '../src/config/db.js';

const app = createApp();
let ready = null;

export default async function handler(req, res) {
  try {
    ready ??= connectDb();
    await ready;
  } catch (err) {
    ready = null;
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'database unavailable' }));
    return;
  }
  return app(req, res);
}
