export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { cnpj } = req.query;
    if (!cnpj || !/^\d{14}$/.test(cnpj)) {
        return res.status(400).json({ error: 'CNPJ inválido' });
    }

    try {
        const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const data = await r.json();
        return res.status(r.status).json(data);
    } catch (e) {
        return res.status(502).json({ error: 'Erro ao consultar Receita Federal' });
    }
}
