const { createClient } = require('@supabase/supabase-js');

// ── Token cache (lives while the function is warm)
let _token = null, _tokenExp = 0;

async function getToken() {
    if (_token && Date.now() < _tokenExp - 60_000) return _token;
    const res = await fetch(
        `https://login.microsoftonline.com/${process.env.SP_TENANT_ID}/oauth2/v2.0/token`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type:    'client_credentials',
                client_id:     process.env.SP_CLIENT_ID,
                client_secret: process.env.SP_CLIENT_SECRET,
                scope:         'https://graph.microsoft.com/.default',
            }),
        }
    );
    const d = await res.json();
    if (!res.ok) throw new Error(`Auth SharePoint: ${d.error_description || d.error}`);
    _token    = d.access_token;
    _tokenExp = Date.now() + d.expires_in * 1000;
    return _token;
}

// ── Graph API base URL
function graphBase() {
    const site  = process.env.SP_SITE_ID;
    const drive = process.env.SP_DRIVE_ID ? `drives/${process.env.SP_DRIVE_ID}` : 'drive';
    return `https://graph.microsoft.com/v1.0/sites/${site}/${drive}`;
}

// ── Encode path segments (keeps / as separator)
function enc(p) {
    return p.split('/').map(s => encodeURIComponent(s)).join('/');
}

// ── Generic Graph API call
async function graph(method, path, body, token) {
    const res = await fetch(`${graphBase()}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const e   = new Error(err.error?.message || `Graph ${method} ${res.status}`);
        e.status  = res.status;
        throw e;
    }
    if (res.status === 204) return null;
    return res.json();
}

// ── Upload file binary content
async function graphPut(path, buffer, mimeType, token) {
    const res = await fetch(`${graphBase()}${path}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': mimeType || 'application/octet-stream' },
        body:    buffer,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const e   = new Error(err.error?.message || `Upload ${res.status}`);
        e.status  = res.status;
        throw e;
    }
    return res.json();
}

// ── Create folder chain (skips segments that already exist)
async function ensureFolderPath(folderPath, token) {
    const segments = folderPath.split('/').filter(Boolean);
    let current = '';
    for (const seg of segments) {
        const parent = current;
        current      = current ? `${current}/${seg}` : seg;
        try {
            await graph('GET', `/root:/${enc(current)}`, undefined, token);
        } catch (getErr) {
            if (getErr.status !== 404) throw getErr;
            // Not found — create it under parent
            const parentRef = parent ? `/root:/${enc(parent)}:` : '/root';
            try {
                await graph('POST', `${parentRef}/children`, {
                    name: seg,
                    folder: {},
                    '@microsoft.graph.conflictBehavior': 'fail',
                }, token);
            } catch (createErr) {
                if (createErr.status !== 409) throw createErr; // 409 = concurrent creation, fine
            }
        }
    }
}

// ── Supabase client (uses anon key — tables have permissive RLS)
function sb() {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// ── Document type → SharePoint subfolder name
const DOC_PATHS = {
    cotacao:  '01 - Orçamentos',
    nf:       '02 - Notas fiscais',
    certidao: '06 - Certidão negativa',
};

// ── Sanitize name for SharePoint folder (removes invalid chars)
function spSafe(s) {
    return (s || '').replace(/[<>:"/\\|?*#%@]/g, '').trim().replace(/\s+/g, ' ').substring(0, 50);
}

// ── Build full folder path for a TRF doc type
function buildPath(prjCodigo, spFolder, docType, trfCodigo, trfNome) {
    const ano       = new Date().getFullYear().toString();
    const trfFolder = `${trfCodigo} - ${spSafe(trfNome)}`;
    return [
        'PMO/Registros/Clientes',
        ano,
        'Público',   // fixed for now; future: derive from project type
        spFolder,
        '00 - Gestão de Projetos/08 - Aquisição',
        DOC_PATHS[docType],
        trfFolder,
    ].join('/');
}

// ── Main handler
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action;

    try {

        // ── GET config: sp_folder for a project
        if (req.method === 'GET' && action === 'config') {
            const { prj } = req.query;
            if (!prj) return res.status(400).json({ error: 'prj ausente' });
            const { data } = await sb()
                .from('sp_project_config')
                .select('sp_folder')
                .eq('prj_codigo', prj)
                .single();
            return res.json({ spFolder: data?.sp_folder || null });
        }

        // ── POST config: save sp_folder for a project
        if (req.method === 'POST' && action === 'config') {
            const { prj, spFolder } = req.body || {};
            if (!prj || !spFolder) return res.status(400).json({ error: 'prj e spFolder obrigatórios' });
            const { error } = await sb()
                .from('sp_project_config')
                .upsert({ prj_codigo: prj, sp_folder: spFolder, updated_at: new Date().toISOString() });
            if (error) throw error;
            return res.json({ ok: true });
        }

        // ── GET summary: files (all 3 types) + justificativas for a TRF
        if (req.method === 'GET' && action === 'summary') {
            const { prj, trf, trfNome = '' } = req.query;
            if (!prj || !trf) return res.status(400).json({ error: 'prj e trf obrigatórios' });

            // Get project SharePoint folder config
            const { data: cfg } = await sb()
                .from('sp_project_config')
                .select('sp_folder')
                .eq('prj_codigo', prj)
                .single();

            if (!cfg?.sp_folder) {
                return res.json({ spFolder: null, files: {}, jus: {} });
            }

            const spFolder = cfg.sp_folder;
            const token    = await getToken();

            // Parallel: Graph API listing + Supabase-stored files + justificativas
            const [filesResult, { data: storedFiles }, { data: jusData }] = await Promise.all([
                Promise.all(Object.keys(DOC_PATHS).map(async docType => {
                    const folderPath = buildPath(prj, spFolder, docType, trf, trfNome);
                    try {
                        const data = await graph(
                            'GET',
                            `/root:/${enc(folderPath)}:/children?$select=name,size,webUrl,file,createdDateTime`,
                            undefined,
                            token
                        );
                        return [docType, (data?.value || []).filter(f => f.file)];
                    } catch (e) {
                        if (e.status === 404) return [docType, []];
                        throw e;
                    }
                })),
                sb()
                    .from('sp_files')
                    .select('doc_type,file_name,web_url')
                    .eq('prj_codigo', prj)
                    .eq('trf_codigo', trf),
                sb()
                    .from('sp_justificativas')
                    .select('doc_type,texto')
                    .eq('prj_codigo', prj)
                    .eq('trf_codigo', trf),
            ]);

            const files = Object.fromEntries(filesResult);

            // Merge Supabase-stored files — garante links persistentes mesmo se SP path mudar
            (storedFiles || []).forEach(sf => {
                if (!files[sf.doc_type]) files[sf.doc_type] = [];
                if (!files[sf.doc_type].some(f => f.name === sf.file_name)) {
                    files[sf.doc_type].push({ name: sf.file_name, webUrl: sf.web_url, size: null, file: true });
                }
            });

            const jus = {};
            (jusData || []).forEach(r => { jus[r.doc_type] = r.texto; });

            return res.json({ spFolder, files, jus });
        }

        // ── POST upload: upload a file to a TRF doc folder
        if (req.method === 'POST' && action === 'upload') {
            const { prj, trfCodigo, trfNome, docType, fileName, fileBase64, mimeType } = req.body || {};
            if (!prj || !trfCodigo || !docType || !fileName || !fileBase64) {
                return res.status(400).json({ error: 'Parâmetros ausentes' });
            }
            if (!DOC_PATHS[docType]) return res.status(400).json({ error: 'Tipo de documento inválido' });

            // Get project SP config
            const { data: cfg } = await sb()
                .from('sp_project_config')
                .select('sp_folder')
                .eq('prj_codigo', prj)
                .single();
            if (!cfg?.sp_folder) return res.status(400).json({ error: 'Pasta SP do projeto não configurada' });

            const token      = await getToken();
            const folderPath = buildPath(prj, cfg.sp_folder, docType, trfCodigo, trfNome);

            // Ensure all folders in the path exist (creates only missing ones)
            await ensureFolderPath(folderPath, token);

            // Upload file
            const buffer   = Buffer.from(fileBase64, 'base64');
            const filePath = `${folderPath}/${fileName}`;
            const item     = await graphPut(
                `/root:/${enc(filePath)}:/content`,
                buffer,
                mimeType || 'application/octet-stream',
                token
            );

            // Persiste link no Supabase — fonte de verdade para listagem após reloads
            await sb().from('sp_files').upsert({
                prj_codigo: prj, trf_codigo: trfCodigo, doc_type: docType,
                file_name: item.name || fileName, web_url: item.webUrl,
            }, { onConflict: 'prj_codigo,trf_codigo,doc_type,file_name' });

            return res.json({ ok: true, webUrl: item.webUrl, name: item.name });
        }

        // ── POST jus: save/update a justificativa
        if (req.method === 'POST' && action === 'jus') {
            const { prj, trf, docType, texto } = req.body || {};
            if (!prj || !trf || !docType) return res.status(400).json({ error: 'Parâmetros ausentes' });
            if (!DOC_PATHS[docType]) return res.status(400).json({ error: 'Tipo de documento inválido' });
            const { error } = await sb()
                .from('sp_justificativas')
                .upsert({
                    prj_codigo: prj, trf_codigo: trf, doc_type: docType,
                    texto, updated_at: new Date().toISOString(),
                }, { onConflict: 'prj_codigo,trf_codigo,doc_type' });
            if (error) throw error;
            return res.json({ ok: true });
        }

        // ── POST jus-delete: remove a justificativa
        if (req.method === 'POST' && action === 'jus-delete') {
            const { prj, trf, docType } = req.body || {};
            if (!prj || !trf || !docType) return res.status(400).json({ error: 'Parâmetros ausentes' });
            const { error } = await sb()
                .from('sp_justificativas')
                .delete()
                .eq('prj_codigo', prj)
                .eq('trf_codigo', trf)
                .eq('doc_type', docType);
            if (error) throw error;
            return res.json({ ok: true });
        }

        return res.status(404).json({ error: 'Ação não encontrada' });

    } catch (err) {
        console.error('[sharepoint]', err.message);
        return res.status(err.status || 500).json({ error: err.message });
    }
};
