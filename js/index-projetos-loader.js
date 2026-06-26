(async function () {
    const SB_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';
    const HDRS  = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` };

    async function sbGet(path) {
        const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: HDRS });
        if (!r.ok) throw new Error(await r.text());
        return r.json();
    }

    function odsImg(num) {
        const p = String(num).padStart(2, '0');
        return `<img src="ODS/${p}_0.webp" class="ods-icon" alt="ODS ${num}" title="ODS ${num}" loading="lazy"
                     onerror="this.src='ODS/${num}_0.webp'">`;
    }

    function cardHtml(p, cat, idx) {
        const catSlug = cat?.slug || 'economico';
        const img     = p.imagem_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800';
        const ods     = (p.ods || []).slice(0, 2).map(odsImg).join('');
        const delays  = ['', ' delay-1', ' delay-2'];
        const delay   = delays[idx % 3];
        return `
        <div class="col-lg-4 col-md-6 reveal-on-scroll${delay}">
            <div class="project-card cat-${catSlug}">
                <div class="project-img" style="background-image:url('${img}')"></div>
                <div class="project-content" style="display:flex;flex-direction:column;height:100%">
                    <div><span class="project-tag">${p.subtag || cat?.nome || ''}</span></div>
                    <h3>${p.titulo}</h3>
                    <p>${p.resumo || ''}</p>
                    <div class="project-ods">${ods}</div>
                    <a href="projetos.html" class="project-link mt-auto">Saiba mais <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>`;
    }

    try {
        const [categorias, projetos] = await Promise.all([
            sbGet('categorias?select=id,nome,slug'),
            sbGet('projetos?destaque=eq.true&publicado=eq.true&order=ordem&limit=6&select=id,titulo,subtag,resumo,categoria_id,imagem_url,ods')
        ]);

        if (!projetos.length) return;

        const row = document.getElementById('projetos-home-row');
        if (!row) return;

        row.innerHTML = projetos.map((p, i) => {
            const cat = categorias.find(c => c.id === p.categoria_id);
            return cardHtml(p, cat, i);
        }).join('');

        // Re-dispara animações GSAP se já inicializadas
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    } catch (e) {
        // Silently fallback to static HTML
    }
})();
