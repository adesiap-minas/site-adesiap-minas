const https = require('https');

const TOTVS_URL = 'https://agenciade142650.rm.cloudtotvs.com.br:8051/api/framework/v1/consultaSQLServer/RealizaConsulta/teste/1/T';

function httpsGet(url, headers) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || 443,
            path: parsed.pathname + parsed.search,
            method: 'GET',
            headers,
            rejectUnauthorized: false, // TOTVS RM usa certificado self-signed
        };
        const req = https.request(options, res => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.end();
    });
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const user = process.env.TOTVS_USER;
    const pass = process.env.TOTVS_PASS;

    if (!user || !pass) {
        return res.status(500).json({ error: 'Credenciais TOTVS não configuradas (TOTVS_USER / TOTVS_PASS)' });
    }

    const token = Buffer.from(`${user}:${pass}`).toString('base64');

    try {
        const { status, body } = await httpsGet(TOTVS_URL, {
            'Authorization': `Basic ${token}`,
            'Accept': 'application/json',
        });

        if (status < 200 || status >= 300) {
            console.error('TOTVS HTTP', status, body.slice(0, 500));
            return res.status(status).json({ error: 'Erro na API TOTVS', detalhe: body.slice(0, 500) });
        }

        let data;
        try {
            data = JSON.parse(body);
        } catch {
            return res.status(502).json({ error: 'Resposta inválida do TOTVS RM', detalhe: body.slice(0, 200) });
        }

        console.log(`TOTVS: ${Array.isArray(data) ? data.length : '?'} registros`);
        return res.status(200).json(data);

    } catch (err) {
        console.error('TOTVS fetch error:', err.message);
        return res.status(500).json({ error: 'Falha ao consultar TOTVS RM', detalhe: err.message });
    }
};
