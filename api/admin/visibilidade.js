// api/admin/visibilidade.js — Controle de visibilidade de páginas e seções
// GET público · PUT super_admin apenas

const SB_URL      = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function decodeJWT(req) {
    const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
    if (!auth) return null;
    const parts = auth.split('.');
    if (parts.length !== 3) return null;
    try { return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')); }
    catch { return null; }
}

async function sb(path, method = 'GET', body) {
    const opts = {
        method,
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, opts);
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.message || json.error || `Erro ${r.status}`);
    return json;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    if (!SB_URL || !SERVICE_KEY)
        return res.status(500).json({ error: 'Variáveis de ambiente ausentes.' });

    try {
        // ── GET: público ─────────────────────────────────────────────────────
        if (req.method === 'GET') {
            const rows = await sb('visibilidade_site?select=chave,visivel&order=tipo,label');
            const data = {};
            rows.forEach(r => { data[r.chave] = r.visivel; });
            res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
            return res.status(200).json(data);
        }

        // ── PUT: super_admin apenas ──────────────────────────────────────────
        if (req.method === 'PUT') {
            const payload = decodeJWT(req);
            if (!payload || payload.exp < Math.floor(Date.now() / 1000))
                return res.status(401).json({ error: 'Não autorizado.' });
            if (payload?.app_metadata?.perfil !== 'super_admin')
                return res.status(403).json({ error: 'Acesso negado.' });

            const { chave, visivel } = req.body || {};
            if (!chave || typeof visivel !== 'boolean')
                return res.status(400).json({ error: 'chave e visivel são obrigatórios.' });

            await sb(
                `visibilidade_site?chave=eq.${encodeURIComponent(chave)}`,
                'PATCH',
                { visivel, atualizado_em: new Date().toISOString() }
            );
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Método não permitido.' });

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};
