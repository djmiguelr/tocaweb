import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://tocastereo.com'],
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Proxy para el stream
app.use('/stream', createProxyMiddleware({
  target: 'https://colombiawebs.com.co',
  changeOrigin: true,
  secure: false, // Permitir certificados autofirmados
  pathRewrite: {
    '^/stream': '/proxy/tocaestereo/stream'
  },
  // Configuración de timeouts
  proxyTimeout: 10000, // 10 segundos
  timeout: 10000,
  // Configuración de reconexión
  retry: 3,
  // Configuración de headers
  headers: {
    'User-Agent': 'TocaStereo/1.0',
    'Accept': '*/*',
    'Connection': 'keep-alive'
  },
  // Manejo de errores
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Stream temporarily unavailable',
        message: err.message
      });
    }
  },
  // Manejo de respuesta del proxy
  onProxyRes: (proxyRes, req, res) => {
    // Log de la respuesta
    console.log('Proxy response:', {
      status: proxyRes.statusCode,
      headers: proxyRes.headers
    });
  }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
