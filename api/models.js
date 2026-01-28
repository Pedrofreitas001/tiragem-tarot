// Vercel Serverless Function - /api/models
// Lista modelos disponíveis na sua conta Gemini

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_KEY) {
        return res.status(500).json({ error: 'GEMINI_KEY não configurada' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data });
        }

        // Filtrar apenas modelos que suportam generateContent
        const generateContentModels = data.models?.filter(m =>
            m.supportedGenerationMethods?.includes('generateContent')
        ).map(m => ({
            name: m.name,
            displayName: m.displayName,
            methods: m.supportedGenerationMethods
        }));

        return res.json({
            total: data.models?.length || 0,
            generateContentModels: generateContentModels || [],
            allModels: data.models?.map(m => m.name) || []
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
