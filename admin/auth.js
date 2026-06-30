// ── AUTENTICAÇÃO UNIFICADA (admin/bpc.html, admin/projetos.html, admin/configuracoes.html) ──
// Self-contained: usa suas próprias constantes para não colidir com o sbFetch de cada página.
const AUTH_SB_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
const AUTH_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';

function entrarNoApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'flex';
    if (typeof init === 'function') init();
}

async function fazerLogin() {
    const input = document.getElementById('senhaInput');
    const senha = input ? input.value.trim() : '';
    if (!senha) return;
    const erroEl = document.getElementById('loginError');
    try {
        const r = await fetch(`${AUTH_SB_URL}/rest/v1/configuracoes?chave=eq.admin_senha&select=valor`, {
            headers: { 'apikey': AUTH_SB_KEY, 'Authorization': `Bearer ${AUTH_SB_KEY}` }
        });
        const rows = r.ok ? await r.json() : [];
        const senhaCorreta = rows?.[0]?.valor || localStorage.getItem('admin_senha') || 'adesiap2026';
        if (senha === senhaCorreta) {
            localStorage.setItem('admin_logado', '1');
            entrarNoApp();
        } else if (erroEl) {
            erroEl.style.display = 'block';
        }
    } catch (e) {
        if (erroEl) erroEl.style.display = 'block';
    }
}

function fazerLogout() {
    localStorage.removeItem('admin_logado');
    location.reload();
}

if (localStorage.getItem('admin_logado') === '1') {
    entrarNoApp();
}
