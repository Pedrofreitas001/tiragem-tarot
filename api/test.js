// Vercel Serverless Function - /api/test
// Endpoint para testar se a API Gemini está funcionando

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_KEY) {
        return res.status(500).json({ error: 'GEMINI_KEY não configurada' });
    }

    try {
        // Teste simples com o Gemini
        const testPrompt = `Responda apenas com um JSON válido: {"status": "ok", "message": "Gemini funcionando"}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: testPrompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 100,
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Gemini API error',
                details: data.error || data,
                status: response.status
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return res.json({
            success: true,
            geminiResponse: text,
            rawResponse: data
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Exception',
            message: error.message,
            stack: error.stack
        });
    }
}
