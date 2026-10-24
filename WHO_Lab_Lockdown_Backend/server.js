const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.ALLOWED_ORIGIN || '*' } });
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
let game = { started: false, startedAt: null, updatedAt: Date.now() };
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) console.warn('Set ADMIN_PASSWORD in the hosting environment before publishing.');
app.get('/api/state', (_req, res) => res.json(game));
app.post('/api/auth', (req, res) => {
  if (!ADMIN_PASSWORD || req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: 'Admin authentication failed' });
  res.json({ ok: true });
});
app.post('/api/start', (req, res) => {
  if (!ADMIN_PASSWORD || req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: 'Admin authentication failed' });
  game = { started: true, startedAt: new Date().toISOString(), updatedAt: Date.now() };
  io.emit('challenge:start', game);
  res.json({ ok: true, state: game });
});
app.post('/api/reset', (req, res) => {
  if (!ADMIN_PASSWORD || req.body.password !== ADMIN_PASSWORD) return res.status(401).json({ ok: false, error: 'Admin authentication failed' });
  game = { started: false, startedAt: null, updatedAt: Date.now() };
  io.emit('challenge:reset', game);
  res.json({ ok: true, state: game });
});
io.on('connection', socket => { socket.emit('challenge:state', game); });
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`WHO Lab Lockdown listening on ${port}`));
