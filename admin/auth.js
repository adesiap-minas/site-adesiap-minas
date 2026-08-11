// ── AUTH.JS v3 — Supabase Auth com redirecionamento por perfil ────────────────
// Defina antes deste script: window.PERFIS_PERMITIDOS = ['super_admin', 'perfil1']

const AUTH_SB_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
const AUTH_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';

// Página padrão de cada perfil após o login
const PERFIL_HOME = {
    super_admin:          'bpc.html',
    editor:               'projetos.html',
    ouvidoria_compliance: 'ouvidoria.html',
    gestor_projetos:      'bpc.html',
    operador_totvs:       'erp.html',
    comercial_captacao:   'bpc.html',
};

const PERFIL_LABELS = {
    super_admin:          'Super Admin',
    editor:               'Editor de Conteúdo',
    ouvidoria_compliance: 'Ouvidoria & Compliance',
    gestor_projetos:      'Gestor de Projetos',
    operador_totvs:       'Operador TOTVS',
    comercial_captacao:   'Comercial / Captação',
};

let _sb = null;

function getSB() {
    if (!_sb) {
        _sb = window.supabase.createClient(AUTH_SB_URL, AUTH_SB_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                storageKey: 'adesiap_admin_auth',
                storage: window.localStorage,
            }
        });
    }
    return _sb;
}

function getPerfil(user) {
    // app_metadata é gravável apenas pelo servidor — não pode ser adulterado pelo usuário
    return user?.app_metadata?.perfil || null;
}

function filtrarSidebar(perfil) {
    if (perfil === 'super_admin') return; // Super Admin vê tudo
    document.querySelectorAll('[data-perfis]').forEach(el => {
        const permitidos = el.dataset.perfis.split(',').map(p => p.trim());
        if (!permitidos.includes(perfil)) el.style.display = 'none';
    });
}

function exibirInfoUsuario(user) {
    const perfil = getPerfil(user);
    const userInfo  = document.getElementById('userInfo');
    const userNome  = document.getElementById('userNome');
    const userPerfilEl = document.getElementById('userPerfil');
    if (userInfo)  userInfo.style.display = 'block';
    if (userNome)  userNome.textContent = user.email;
    if (userPerfilEl) userPerfilEl.textContent = PERFIL_LABELS[perfil] || perfil || '—';
}

async function entrarNoApp(user) {
    const perfil = getPerfil(user);
    // Página de login = qualquer página que não tenha #appShell (index.html)
    const ehLogin = !document.getElementById('appShell');

    // Se é a página de login, redireciona para o módulo do perfil
    if (ehLogin) {
        const destino = PERFIL_HOME[perfil] || 'erp.html';
        window.location.href = destino;
        return;
    }

    const permitidos = Array.isArray(window.PERFIS_PERMITIDOS)
        ? window.PERFIS_PERMITIDOS
        : ['super_admin'];

    // Perfil sem acesso a este módulo → redireciona para página correta (sem logout)
    if (perfil !== 'super_admin' && !permitidos.includes(perfil)) {
        const destino = PERFIL_HOME[perfil] || 'index.html';
        window.location.href = destino;
        return;
    }

    exibirInfoUsuario(user);
    filtrarSidebar(perfil);

    // Ativa o shell via atributo CSS (sem flash)
    document.documentElement.setAttribute('data-auth', '1');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display   = 'flex';

    if (typeof init === 'function') init();
}

async function fazerLogin() {
    const emailEl = document.getElementById('emailInput');
    const senhaEl = document.getElementById('senhaInput');
    const erroEl  = document.getElementById('loginError');
    const btnEl   = document.getElementById('btnLogin');

    const email = emailEl?.value.trim() || '';
    const senha = senhaEl?.value || '';
    if (!email || !senha) return;

    if (btnEl)  { btnEl.disabled = true; btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando…'; }
    if (erroEl) { erroEl.style.display = 'none'; }

    try {
        const { data, error } = await getSB().auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        await entrarNoApp(data.user);
    } catch (e) {
        if (erroEl) {
            erroEl.textContent = (e.message || '').includes('Invalid login credentials')
                ? 'E-mail ou senha incorretos.'
                : 'Erro ao entrar. Tente novamente.';
            erroEl.style.display = 'block';
        }
    } finally {
        if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = 'Entrar'; }
    }
}

async function fazerLogout() {
    await getSB().auth.signOut();
    location.reload();
}

// ── Inicialização: carrega SDK e verifica sessão ─────────────────────────────
(async function iniciarAuth() {
    // Carrega o Supabase SDK via CDN se ainda não estiver disponível
    if (!window.supabase) {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
            s.onload  = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // Restaura sessão existente (token no localStorage do SDK — não manipulável pelo usuário)
    const { data: { session } } = await getSB().auth.getSession();
    if (session?.user) {
        await entrarNoApp(session.user);
    }
    // Sem sessão válida → loginScreen já visível por padrão no CSS
})();
