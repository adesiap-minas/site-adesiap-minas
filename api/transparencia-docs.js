// api/transparencia-docs.js — Listagem pública de documentos do Portal de Transparência
// Leitura via anon key; RLS garante que só documentos ativos são retornados.

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=60');
    if (req.method !== 'GET') return res.status(405).end();

    const r = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/documentos_transparencia` +
        `?select=tab,year,title,sp_url,sort_order` +
        `&active=eq.true` +
        `&order=tab,year.desc,sort_order,created_at.desc`,
        { headers: { 'apikey': process.env.SUPABASE_ANON_KEY } }
    );

    if (!r.ok) return res.status(500).json({ error: 'Erro ao buscar documentos' });
    const rows = await r.json();

    // Agrupa por aba e depois por ano
    const grouped = {};
    for (const row of rows) {
        if (!grouped[row.tab]) grouped[row.tab] = {};
        const key = row.year ? String(row.year) : 'sem-ano';
        if (!grouped[row.tab][key]) grouped[row.tab][key] = [];
        grouped[row.tab][key].push({ title: row.title, url: row.sp_url });
    }

    return res.json(grouped);
};
