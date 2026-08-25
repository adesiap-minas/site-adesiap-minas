// api/admin/transparencia-docs.js — Gestão do Portal de Transparência
//
// Ações públicas (sem auth):
//   GET  ?action=public-list  → documentos ativos agrupados por aba/ano
//
// Ações admin (requer JWT super_admin ou editor):
//   GET  ?action=list         → todos os documentos (inclusive inativos)
//   POST ?action=upload       → { tab, year, title, descritivo, filename, fileBase64, mimeType }
//   POST ?action=delete       → { id }

const SB_URL      = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANON_KEY    = process.env.SUPABASE_ANON_KEY;

const TAB_INFO = {
    inst:      { label: 'Institucional',                 hasYear: false },
    contas:    { label: 'Prestação de Contas',           hasYear: true  },
    relatorios:{ label: 'Relatórios e Atas',             hasYear: true  },
    editais:   { label: 'Editais',                       hasYear: true  },
    parcerias: { label: 'Parcerias Públicas e Privadas', hasYear: true  },
    mural:     { label: 'Contratos e Parcerias',         hasYear: true  },
};

// ── SharePoint Auth ──────────────────────────────────────────────────────────
let _spToken = null, _spExp = 0;
async function getSpToken() {
    if (_spToken && Date.now() < _spExp - 60_000) return _spToken;
    const res = await fetch(
        `https://login.microsoftonline.com/${process.env.SP_TENANT_ID}/oauth2/v2.0/token`,
        { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'client_credentials',
              client_id: process.env.SP_CLIENT_ID, client_secret: process.env.SP_CLIENT_SECRET,
              scope: 'https://graph.microsoft.com/.default' }) }
    );
    const d = await res.json();
    if (!res.ok) throw new Error(`Auth SP: ${d.error_description || d.error}`);
    _spToken = d.access_token; _spExp = Date.now() + d.expires_in * 1000;
    return _spToken;
}

function graphBase() {
    const site  = process.env.SP_SITE_ID;
    const drive = process.env.SP_DRIVE_ID ? `drives/${process.env.SP_DRIVE_ID}` : 'drive';
    return `https://graph.microsoft.com/v1.0/sites/${site}/${drive}`;
}

function enc(p) { return p.split('/').map(s => encodeURIComponent(s)).join('/'); }

async function graph(method, path, body, token) {
    const res = await fetch(`${graphBase()}${path}`, {
        method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const e = new Error(err.error?.message || `Graph ${method} ${res.status}`);
        e.status = res.status; throw e;
    }
    if (res.status === 204) return null;
    return res.json();
}

async function graphPut(path, buffer, mimeType, token) {
    const res = await fetch(`${graphBase()}${path}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType || 'application/octet-stream' },
        body: buffer,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const e = new Error(err.error?.message || `Upload ${res.status}`); e.status = res.status; throw e;
    }
    return res.json();
}

async function ensureFolderPath(folderPath, token) {
    const segments = folderPath.split('/').filter(Boolean);
    let current = '';
    for (const seg of segments) {
        const parent = current;
        current = current ? `${current}/${seg}` : seg;
        try {
            await graph('GET', `/root:/${enc(current)}`, undefined, token);
        } catch (err) {
            if (err.status !== 404) throw err;
            const parentRef = parent ? `/root:/${enc(parent)}:` : '/root';
            try {
                await graph('POST', `${parentRef}/children`,
                    { name: seg, folder: {}, '@microsoft.graph.conflictBehavior': 'fail' }, token);
            } catch (createErr) {
                if (createErr.status !== 409) throw createErr;
            }
        }
    }
}

// ── Supabase REST ────────────────────────────────────────────────────────────
async function sbFetch(path, method = 'GET', body, key) {
    const opts = { method, headers: {
        'apikey': key, 'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json', 'Prefer': 'return=representation',
    }};
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, opts);
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.message || json.error || `Erro ${r.status}`);
    return json;
}

// ── JWT decode ───────────────────────────────────────────────────────────────
function decodeJWT(req) {
    const auth = (req.headers['authorization'] || '').replace('Bearer ', '').trim();
    if (!auth) return null;
    const parts = auth.split('.');
    if (parts.length !== 3) return null;
    try { return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')); }
    catch { return null; }
}

function isAdmin(req) {
    const jwt = decodeJWT(req);
    const perfil = jwt?.app_metadata?.perfil;
    return perfil === 'super_admin' || perfil === 'editor';
}

// ── Caminho SharePoint ───────────────────────────────────────────────────────
function buildSpPath(tab, year) {
    const info  = TAB_INFO[tab];
    const parts = ['Registros/Documentos site/Transparência', info.label];
    if (info.hasYear && year) parts.push(String(year));
    return parts.join('/');
}

// ── Handler principal ────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const action = req.query.action;

    try {
        // ── Listagem pública — sem autenticação ──────────────────────────────
        if (req.method === 'GET' && action === 'public-list') {
            res.setHeader('Cache-Control', 'public, max-age=60');
            const rows = await sbFetch(
                'documentos_transparencia' +
                '?select=tab,year,title,descritivo,sp_url,sort_order' +
                '&active=eq.true' +
                '&order=tab,year.desc,sort_order,created_at.desc',
                'GET', undefined, ANON_KEY
            );
            const grouped = {};
            for (const row of rows) {
                if (!grouped[row.tab]) grouped[row.tab] = {};
                const key = row.year ? String(row.year) : 'sem-ano';
                if (!grouped[row.tab][key]) grouped[row.tab][key] = [];
                grouped[row.tab][key].push({ title: row.title, descritivo: row.descritivo || '', url: row.sp_url });
            }
            return res.json(grouped);
        }

        // ── A partir daqui: requer autenticação ─────────────────────────────
        if (!isAdmin(req))
            return res.status(403).json({ error: 'Acesso negado.' });

        // ── Listar todos (admin) ─────────────────────────────────────────────
        if (req.method === 'GET' && action === 'list') {
            const data = await sbFetch(
                'documentos_transparencia?select=*&order=tab,year.desc,sort_order,created_at.desc',
                'GET', undefined, SERVICE_KEY
            );
            return res.json(data);
        }

        // ── Upload ───────────────────────────────────────────────────────────
        if (req.method === 'POST' && action === 'upload') {
            const { tab, year, title, descritivo, filename, fileBase64, mimeType } = req.body || {};
            if (!tab || !title || !filename || !fileBase64)
                return res.status(400).json({ error: 'Parâmetros obrigatórios: tab, title, filename, fileBase64' });
            if (!TAB_INFO[tab])
                return res.status(400).json({ error: 'Aba inválida' });

            const token      = await getSpToken();
            const folderPath = buildSpPath(tab, year);
            await ensureFolderPath(folderPath, token);

            const buffer   = Buffer.from(fileBase64, 'base64');
            const filePath = `${folderPath}/${filename}`;
            const item     = await graphPut(`/root:/${enc(filePath)}:/content`, buffer,
                                mimeType || 'application/octet-stream', token);

            const [row] = await sbFetch('documentos_transparencia', 'POST', {
                tab, year: year || null, title,
                descritivo: descritivo || null,
                filename: item.name || filename,
                sp_url: item.webUrl,
                active: true,
            }, SERVICE_KEY);
            return res.json({ ok: true, doc: row });
        }

        // ── Remover (soft delete) ────────────────────────────────────────────
        if (req.method === 'POST' && action === 'delete') {
            const { id } = req.body || {};
            if (!id) return res.status(400).json({ error: 'id ausente' });
            await sbFetch(`documentos_transparencia?id=eq.${id}`, 'PATCH', { active: false }, SERVICE_KEY);
            return res.json({ ok: true });
        }

        return res.status(404).json({ error: 'Ação não encontrada' });

    } catch (err) {
        console.error('[admin/transparencia-docs]', err.message);
        return res.status(err.status || 500).json({ error: err.message });
    }
};
