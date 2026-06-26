(async function () {
    const SUPABASE_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';

    function waUrl(numero, msg) {
        return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
    }

    let cfg = {};
    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/configuracoes?grupo=eq.whatsapp&select=chave,valor`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        const rows = await res.json();
        rows.forEach(r => { cfg[r.chave] = r.valor || ''; });
    } catch (e) {
        return; // falha silenciosa — links originais permanecem
    }

    // ── TOPBAR ──────────────────────────────────────────────────────────────
    const topbarLinks = document.querySelectorAll('.topbar-link');
    [1, 2, 3].forEach((i, idx) => {
        const el = topbarLinks[idx];
        if (!el) return;
        const num = cfg[`wa_topbar_${i}_numero`];
        const msg = cfg[`wa_topbar_${i}_msg`];
        const label = cfg[`wa_topbar_${i}_label`];
        if (num && msg) el.href = waUrl(num, msg);
        if (label) {
            const full = el.querySelector('.tb-full');
            const short = el.querySelector('.tb-short');
            if (full) full.textContent = `ATENDIMENTO ${label}`;
            if (short) short.textContent = label;
        }
    });

    // ── CARD FALE CONOSCO ────────────────────────────────────────────────────
    const cardWa = document.querySelector('[data-wa="fale-conosco"]');
    if (cardWa && cfg['wa_fale_conosco_numero']) {
        cardWa.href = `https://wa.me/${cfg['wa_fale_conosco_numero']}`;
        const labelEl = cardWa.querySelector('[data-wa-label]');
        if (labelEl && cfg['wa_fale_conosco_label']) labelEl.textContent = cfg['wa_fale_conosco_label'];
    }

    // ── CTAs POR PÁGINA ──────────────────────────────────────────────────────
    document.querySelectorAll('[data-wa-cta]').forEach(el => {
        const key = el.getAttribute('data-wa-cta');
        const num = cfg[`wa_cta_${key}_numero`];
        const msg = cfg[`wa_cta_${key}_msg`];
        if (num && msg) {
            el.href = waUrl(num, msg);
            el.target = '_blank';
            el.rel = 'noopener';
        }
    });
})();
