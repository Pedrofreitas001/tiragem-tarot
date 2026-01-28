// Vercel Serverless Function - /api/health
// Endpoint para verificar se a API está configurada corretamente

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    res.json({
        status: 'ok',
        geminiConfigured: !!GEMINI_KEY,
        timestamp: new Date().toISOString(),
        environment: process.env.VERCEL ? 'vercel' : 'local'
    });
}
