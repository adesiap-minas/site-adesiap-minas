// api/admin/usuarios.js — Gestão de usuários admin (service role only)
// Requer: SUPABASE_URL e SUPABASE_SERVICE_KEY nas variáveis de ambiente do Vercel

const SB_URL         = process.env.SUPABASE_URL;
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const ANON_KEY       = process.env.SUPABASE_ANON_KEY;

const PERFIS_VALIDOS = ['super_admin','editor','ouvidoria_compliance','gestor_projetos','operador_totvs','comercial_captacao'];

// ── Decodifica o JWT localmente (sem chamada HTTP) e verifica perfil ─────────
function autenticarRequisicao(req) {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) throw new Error('Não autorizado: token ausente.');

    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Não autorizado: token malformado.');

    let payload;
    try {
        payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    } catch {
        throw new Error('Não autorizado: token inválido.');
    }

    if (!payload.exp || Math.floor(Date.now() / 1000) > payload.exp)
        throw new Error('Não autorizado: token expirado.');

    const perfil = payload?.app_metadata?.perfil;
    if (perfil !== 'super_admin') throw new Error('Acesso negado: apenas Super Admin pode gerenciar usuários.');
    return payload;
}

// ── Helper: chamada à Admin API do Supabase ──────────────────────────────────
async function sbAdmin(path, method = 'GET', body) {
    const opts = {
        method,
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
        },
    };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(`${SB_URL}/auth/v1/admin/${path}`, opts);
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.msg || json.message || json.error_description || `Erro ${r.status}`);
    return json;
}

// ── Handler principal ────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    const missing = [!SB_URL && 'SUPABASE_URL', !SERVICE_KEY && 'SUPABASE_SERVICE_KEY', !ANON_KEY && 'SUPABASE_ANON_KEY'].filter(Boolean);
    if (missing.length) {
        return res.status(500).json({ error: `Variáveis de ambiente ausentes no Vercel: ${missing.join(', ')}` });
    }

    try {
        autenticarRequisicao(req);

        // ── GET: listagem (uma única chamada ao Supabase) ────────────────────
        if (req.method === 'GET') {
            const data = await sbAdmin('users?per_page=500');
            const users = Array.isArray(data) ? data : (data.users || []);
            users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return res.status(200).json({ users });
        }

        // ── POST: criar usuário ──────────────────────────────────────────────
        if (req.method === 'POST') {
            const { email, senha, perfil } = req.body || {};
            if (!email || !senha || !perfil) return res.status(400).json({ error: 'email, senha e perfil são obrigatórios.' });
            if (!PERFIS_VALIDOS.includes(perfil)) return res.status(400).json({ error: 'Perfil inválido.' });
            if (senha.length < 8) return res.status(400).json({ error: 'Senha deve ter ao menos 8 caracteres.' });

            const user = await sbAdmin('users', 'POST', {
                email,
                password: senha,
                email_confirm: true,
                app_metadata: { perfil },
            });
            return res.status(201).json({ user });
        }

        // ── PATCH: atualizar perfil ──────────────────────────────────────────
        if (req.method === 'PATCH') {
            const { id, perfil } = req.body || {};
            if (!id || !perfil) return res.status(400).json({ error: 'id e perfil são obrigatórios.' });
            if (!PERFIS_VALIDOS.includes(perfil)) return res.status(400).json({ error: 'Perfil inválido.' });

            const user = await sbAdmin(`users/${id}`, 'PUT', {
                app_metadata: { perfil },
            });
            return res.status(200).json({ user });
        }

        // ── PUT: redefinir senha ─────────────────────────────────────────────
        if (req.method === 'PUT') {
            const { id, senha } = req.body || {};
            if (!id || !senha) return res.status(400).json({ error: 'id e senha são obrigatórios.' });
            if (senha.length < 8) return res.status(400).json({ error: 'Senha deve ter ao menos 8 caracteres.' });

            const user = await sbAdmin(`users/${id}`, 'PUT', { password: senha });
            return res.status(200).json({ user });
        }

        // ── DELETE: excluir usuário ──────────────────────────────────────────
        if (req.method === 'DELETE') {
            const { id } = req.body || {};
            if (!id) return res.status(400).json({ error: 'id é obrigatório.' });

            await sbAdmin(`users/${id}`, 'DELETE');
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Método não permitido.' });

    } catch (e) {
        const status = e.message.startsWith('Não autorizado') || e.message.startsWith('Acesso negado') ? 403 : 500;
        return res.status(status).json({ error: e.message });
    }
};
