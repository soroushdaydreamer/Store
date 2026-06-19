/**
 * Local Development Server
 * Simulates Cloudflare Pages environment with in-memory KV store
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import type { AppState, SyncResponse } from './src/types';

const app = express();
const PORT = process.env.SERVER_PORT || 8788;

// In-memory KV store for local development
const memoryKV: Map<string, string> = new Map();
const ENV_STORE_KEY = 'sinanoor-store-data';

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', environment: 'local-dev', timestamp: new Date().toISOString() });
});

// Cloudflare KV Sync API simulation
app.post('/api/sync', (req, res) => {
  const { action, data, deviceId } = req.body;

  if (!action || !deviceId) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: action, deviceId',
      timestamp: new Date().toISOString(),
    } as SyncResponse);
    return;
  }

  if (action === 'backup') {
    if (!data) {
      res.status(400).json({
        success: false,
        message: 'Missing data for backup',
        timestamp: new Date().toISOString(),
      } as SyncResponse);
      return;
    }

    try {
      const key = `${ENV_STORE_KEY}:${deviceId}`;
      memoryKV.set(key, JSON.stringify(data));
      console.log(`[KV] Backup stored for device: ${deviceId}`);

      res.json({
        success: true,
        message: 'Backup successful',
        timestamp: new Date().toISOString(),
      } as SyncResponse);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Backup failed: ' + (err as Error).message,
        timestamp: new Date().toISOString(),
      } as SyncResponse);
    }
    return;
  }

  if (action === 'restore') {
    try {
      const key = `${ENV_STORE_KEY}:${deviceId}`;
      const stored = memoryKV.get(key);

      if (!stored) {
        res.status(404).json({
          success: false,
          message: 'No backup found for this device',
          timestamp: new Date().toISOString(),
        } as SyncResponse);
        return;
      }

      const data = JSON.parse(stored) as AppState;
      console.log(`[KV] Restore completed for device: ${deviceId}`);

      res.json({
        success: true,
        data,
        message: 'Restore successful',
        timestamp: new Date().toISOString(),
      } as SyncResponse);
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Restore failed: ' + (err as Error).message,
        timestamp: new Date().toISOString(),
      } as SyncResponse);
    }
    return;
  }

  res.status(400).json({
    success: false,
    message: 'Invalid action. Use "backup" or "restore"',
    timestamp: new Date().toISOString(),
  } as SyncResponse);
});

// Serve the static files from dist (for production build test)
import path from 'path';
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Local dev server running at http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/sync`);
  console.log(`💾 Using in-memory KV simulation`);
});
