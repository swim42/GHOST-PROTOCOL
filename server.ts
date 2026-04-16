import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API for Ghost Engine stats
  let noiseActive = false;
  let bandwidthLimit = 10; // %
  let currentPersona = 'Neutral';
  let decoySites = ['scholar.google.com', 'arxiv.org', 'nature.com'];
  let siteBlacklist = ['bank.com', 'internal-vpn.net'];
  let vpnActive = false;
  let vpnLocation = 'Germany (Frankfurt)';
  let vpnProtocol = 'WireGuard-NT';

  app.get('/api/status', (req, res) => {
    res.json({
      noiseActive,
      bandwidthLimit,
      currentPersona,
      decoySites,
      siteBlacklist,
      vpnActive,
      vpnLocation,
      vpnProtocol,
      entropy: noiseActive ? 0.85 + Math.random() * 0.1 : 0.42,
      realTraffic: 45 + Math.random() * 10,
      noiseTraffic: noiseActive ? 30 + Math.random() * 15 : 0,
    });
  });

  app.post('/api/toggle-noise', (req, res) => {
    noiseActive = req.body.active;
    res.json({ success: true, active: noiseActive });
  });

  app.post('/api/settings', (req, res) => {
    if (req.body.bandwidthLimit !== undefined) bandwidthLimit = req.body.bandwidthLimit;
    if (req.body.persona !== undefined) currentPersona = req.body.persona;
    if (req.body.decoySites !== undefined) decoySites = req.body.decoySites;
    if (req.body.siteBlacklist !== undefined) siteBlacklist = req.body.siteBlacklist;
    if (req.body.vpnActive !== undefined) vpnActive = req.body.vpnActive;
    if (req.body.vpnLocation !== undefined) vpnLocation = req.body.vpnLocation;
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ghost-Protocol Server running at http://localhost:${PORT}`);
  });
}

startServer();
