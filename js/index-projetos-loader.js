(async function () {
    const SB_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';
    const HDRS  = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` };

    async function sbGet(path) {
        const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: HDRS });
        if (!r.ok) throw new Error(await r.text());
        return r.json();
    }

    function youtubeId(url) {
        if (!url) return null;
        const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    function odsImg(num) {
        const p   = String(num).padStart(2, '0');
        const sfx = num === 1 ? '1' : '0';
        return `<img src="ODS/${p}_${sfx}.webp" class="ods-icon" alt="ODS ${num}" title="ODS ${num}" loading="lazy">`;
    }

    function cardHtml(p, cat, idx) {
        const catSlug = cat?.slug || 'economico';
        const img     = p.imagem_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800';
        const ods     = (p.ods || []).map(odsImg).join('');
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
                    <button type="button" class="project-link open-modal mt-auto" data-project-id="${p.id}">
                        Saiba mais <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }

    // ── MODAL ──────────────────────────────────────────
    let _projetos = [];
    let _categorias = [];

    function abrirModal(id) {
        const p = _projetos.find(x => x.id === id);
        if (!p) return;
        const cat = _categorias.find(c => c.id === p.categoria_id);

        const img = p.imagem_url || '';
        document.getElementById('hpModalHero').style.backgroundImage = img ? `url('${img}')` : '';
        document.getElementById('hpModalTag').textContent = p.subtag || cat?.nome || '';
        document.getElementById('hpModalTag').style.background = cat ? cat.cor_forte : '';
        document.getElementById('hpModalTitle').textContent = p.titulo;

        const meta = [p.local, p.ano].filter(Boolean).join(' · ');
        const metaEl = document.getElementById('hpModalMeta');
        metaEl.innerHTML = meta ? `<i class="fas fa-map-marker-alt"></i>${meta}` : '';

        const desc = p.descricao || p.resumo || '';
        document.getElementById('hpModalDescription').innerHTML = desc.replace(/\n/g, '<br>');

        // Indicadores
        const metricsSection = document.getElementById('hpModalMetricsSection');
        const metricsEl = document.getElementById('hpModalMetrics');
        const indicadores = Array.isArray(p.indicadores) ? p.indicadores.filter(i => i.valor) : [];
        if (indicadores.length) {
            metricsEl.innerHTML = indicadores.map(i =>
                `<div class="modal-metric"><strong>${i.valor}</strong><span>${i.descricao || ''}</span></div>`
            ).join('');
            metricsSection.style.display = '';
        } else { metricsSection.style.display = 'none'; }

        // Parceiros
        const partnersSection = document.getElementById('hpModalPartnersSection');
        const partnersEl = document.getElementById('hpModalPartners');
        const parc = p.parceiros || [];
        if (parc.length) {
            partnersEl.innerHTML = parc.map(n => `<span class="modal-partner-tag">${n}</span>`).join('');
            partnersSection.style.display = '';
        } else { partnersSection.style.display = 'none'; }

        // ODS
        const odsSection = document.getElementById('hpModalOdsSection');
        const odsEl = document.getElementById('hpModalOds');
        const odsNums = p.ods || [];
        if (odsNums.length) {
            odsEl.innerHTML = odsNums.map(n => {
                const pad = String(n).padStart(2, '0');
                const sfx = n === 1 ? '1' : '0';
                return `<img src="ODS/${pad}_${sfx}.webp" alt="ODS ${n}" title="ODS ${n}" loading="lazy">`;
            }).join('');
            odsSection.style.display = '';
        } else { odsSection.style.display = 'none'; }

        // Galeria
        const galSection = document.getElementById('hpModalGaleriaSection');
        const galEl = document.getElementById('hpModalGaleria');
        const galUrls = p.galeria_urls || [];
        if (galSection && galUrls.length) {
            galEl.innerHTML = galUrls.map((url, i) =>
                `<div class="modal-gal-item" onclick="hpAbrirLightbox('${url}','${p.titulo.replace(/'/g,"\\'")}')">
                    <img src="${url}" alt="Foto ${i + 1}" loading="lazy">
                </div>`
            ).join('');
            galSection.style.display = '';
        } else if (galSection) { galSection.style.display = 'none'; }

        // Vídeos
        const vidSection = document.getElementById('hpModalVideoSection');
        const vidEl = document.getElementById('hpModalVideos');
        const vids = p.video_urls || [];
        if (vidSection && vids.length) {
            vidEl.innerHTML = vids.map(url => {
                const ytId = youtubeId(url);
                if (ytId) return `<div class="modal-video-embed">
                    <iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0"
                        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                        allowfullscreen loading="lazy"></iframe></div>`;
                return `<a href="${url}" target="_blank" rel="noopener" class="modal-video-link">
                    <i class="fas fa-play-circle"></i> Assistir vídeo</a>`;
            }).join('');
            vidSection.style.display = '';
        } else if (vidSection) { vidSection.style.display = 'none'; }

        // Documentos PC
        const docsSection = document.getElementById('hpModalDocsSection');
        const docsEl = document.getElementById('hpModalDocs');
        const docs = Array.isArray(p.documentos_pc) ? p.documentos_pc.filter(d => d?.url) : [];
        if (docsSection && docs.length) {
            docsEl.innerHTML = docs.map(doc => {
                const ext = (doc.url.split('.').pop() || '').toLowerCase().replace(/\?.*/, '');
                const icon = ext === 'pdf' ? 'fas fa-file-pdf' : 'fas fa-file-word';
                const extClass = ext === 'pdf' ? 'doc-ext-pdf' : `doc-ext-${ext || 'docx'}`;
                return `<a href="${doc.url}" target="_blank" rel="noopener" class="modal-doc-link">
                    <i class="${icon}" style="color:${ext === 'pdf' ? '#dc2626' : '#2563eb'}"></i>
                    <span class="doc-name">${doc.nome || 'Documento'}</span>
                    <span class="doc-ext ${extClass}">${ext || 'doc'}</span>
                </a>`;
            }).join('');
            docsSection.style.display = '';
        } else if (docsSection) { docsSection.style.display = 'none'; }

        const overlay = document.getElementById('hpProjectModalOverlay');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        const modal = document.getElementById('hpProjectModal');
        if (modal) modal.scrollTop = 0;
    }

    function fecharModal() {
        const overlay = document.getElementById('hpProjectModalOverlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.hpAbrirLightbox = function(url, alt) {
        let lb = document.getElementById('hpLightboxOverlay');
        if (!lb) {
            lb = document.createElement('div');
            lb.id = 'hpLightboxOverlay';
            lb.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;
                align-items:center;justify-content:center;cursor:zoom-out;padding:20px;backdrop-filter:blur(4px)`;
            lb.onclick = () => lb.remove();
            lb.innerHTML = `<img id="hpLbImg" style="max-width:100%;max-height:90vh;border-radius:8px;
                object-fit:contain;box-shadow:0 30px 80px rgba(0,0,0,.5)" alt="">
                <button onclick="event.stopPropagation();this.closest('#hpLightboxOverlay').remove()"
                    style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;
                    color:#fff;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.1rem;
                    display:flex;align-items:center;justify-content:center">×</button>`;
            document.body.appendChild(lb);
        }
        document.getElementById('hpLbImg').src = url;
        document.getElementById('hpLbImg').alt = alt || '';
    };

    // ── BIND CLOSE EVENTS ──────────────────────────────
    function bindModalEvents() {
        const overlay = document.getElementById('hpProjectModalOverlay');
        const closeBtn = document.getElementById('hpModalClose');
        if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
        if (closeBtn) closeBtn.addEventListener('click', fecharModal);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
    }

    // ── MAIN ───────────────────────────────────────────
    const SEL_FULL = 'id,titulo,subtag,resumo,descricao,categoria_id,imagem_url,galeria_urls,video_urls,ods,indicadores,parceiros,local,ano,documentos_pc';
    const SEL_BASE = 'id,titulo,subtag,resumo,descricao,categoria_id,imagem_url,galeria_urls,video_urls,ods,indicadores,parceiros,local,ano';

    bindModalEvents();

    for (const sel of [SEL_FULL, SEL_BASE]) {
        try {
            const [categorias, projetos] = await Promise.all([
                sbGet('categorias?select=id,nome,slug,cor_forte'),
                sbGet(`projetos?destaque=eq.true&publicado=eq.true&order=ordem&limit=6&select=${sel}`)
            ]);

            if (!projetos.length) return;

            _projetos = projetos;
            _categorias = categorias;

            const row = document.getElementById('projetos-home-row');
            if (!row) return;

            row.innerHTML = projetos.map((p, i) => {
                const cat = categorias.find(c => c.id === p.categoria_id);
                return cardHtml(p, cat, i);
            }).join('');

            // Bind modal buttons
            row.querySelectorAll('.open-modal[data-project-id]').forEach(btn => {
                btn.addEventListener('click', () => abrirModal(btn.dataset.projectId));
            });

            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            break;
        } catch (e) {
            // Silently fallback to static HTML on final attempt
        }
    }
})();
