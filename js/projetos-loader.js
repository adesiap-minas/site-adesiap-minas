(async function () {
    const SB_URL = 'https://vpnqqrzzptuselhiemyp.supabase.co';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';
    const HDRS = { 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` };

    // ── FETCH ──────────────────────────────────────────
    async function sbGet(path) {
        const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: HDRS });
        if (!r.ok) throw new Error(await r.text());
        return r.json();
    }

    // ── HELPERS ────────────────────────────────────────
    function youtubeId(url) {
        if (!url) return null;
        const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
    }

    function odsImg(num) {
        const p   = String(num).padStart(2, '0');
        const sfx = num === 1 ? '1' : '0';
        return `<img src="./ODS/${p}_${sfx}.webp" class="ods-icon" alt="ODS ${num}" title="ODS ${num}" loading="lazy">`;
    }

    // ── CARD HTML ──────────────────────────────────────
    function cardHtml(p, cat) {
        const catSlug = cat?.slug || 'economico';
        const img = p.imagem_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800';
        const ods = (p.ods || []).map(odsImg).join('');
        return `
        <div class="col-lg-4 col-md-6 reveal-on-scroll">
            <div class="project-card cat-${catSlug}" data-id="${p.id}">
                <div class="project-img" style="background-image:url('${img}')"></div>
                <div class="project-content">
                    <div><span class="project-tag">${p.subtag || cat?.nome || ''}</span></div>
                    <h3>${p.titulo}</h3>
                    <p>${p.resumo || ''}</p>
                    <div class="project-ods">${ods}</div>
                    <button type="button" class="project-link open-modal" data-project-id="${p.id}">
                        Ler case completo <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }

    // ── SECTION HTML ───────────────────────────────────
    function sectionHtml(secaoNome, projetos, categorias) {
        // Icon and color by section name
        const icons = {
            'Desenvolvimento Econômico': { icon: 'fas fa-chart-line', color: 'var(--azul-institucional)' },
            'Desenvolvimento Social e Geração de Renda': { icon: 'fas fa-hands-helping', color: 'var(--terracota-institucional)' },
            'Sustentabilidade e Infraestrutura': { icon: 'fas fa-leaf', color: 'var(--verde-sustentabilidade)' },
            'Educação, Cultura, Esporte e Lazer': { icon: 'fas fa-palette', color: 'var(--ambar-impacto)' },
        };
        const meta = icons[secaoNome] || { icon: 'fas fa-folder', color: 'var(--azul-institucional)' };
        const cards = projetos.map(p => {
            const cat = categorias.find(c => c.id === p.categoria_id);
            return cardHtml(p, cat);
        }).join('');
        return `
        <div class="category-header reveal-on-scroll">
            <i class="${meta.icon}" style="color:${meta.color}"></i>
            <h3 style="margin:0;color:var(--azul-institucional)">${secaoNome}</h3>
        </div>
        <div class="row g-4 mb-5 category-row">${cards}</div>`;
    }

    // ── RENDER PROJETOS ────────────────────────────────
    function renderProjetos(projetos, categorias) {
        const container = document.getElementById('projetos-container');
        if (!container) return;

        if (!projetos.length) {
            container.innerHTML = `<div class="col-12 text-center" style="padding:60px 0;color:var(--texto-secundario)">
                <i class="fas fa-project-diagram" style="font-size:2.5rem;opacity:.3;display:block;margin-bottom:16px"></i>
                <p>Nenhum projeto encontrado.</p></div>`;
            return;
        }

        // Group by secao from the category
        const secoesOrdem = [
            'Desenvolvimento Econômico',
            'Desenvolvimento Social e Geração de Renda',
            'Sustentabilidade e Infraestrutura',
            'Educação, Cultura, Esporte e Lazer'
        ];

        const bySecao = {};
        projetos.forEach(p => {
            const cat = categorias.find(c => c.id === p.categoria_id);
            const secao = cat?.secao || 'Outros';
            if (!bySecao[secao]) bySecao[secao] = [];
            bySecao[secao].push(p);
        });

        // Render in defined order first, then any extras
        const secoes = [...secoesOrdem, ...Object.keys(bySecao).filter(s => !secoesOrdem.includes(s))];
        const html = secoes
            .filter(s => bySecao[s]?.length)
            .map(s => sectionHtml(s, bySecao[s], categorias))
            .join('');

        container.innerHTML = html;

        // Trigger GSAP card animations if available
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            requestAnimationFrame(() => {
                if (typeof initCardAnimations === 'function') initCardAnimations();
            });
        }

        // Bind modal buttons
        document.querySelectorAll('.open-modal[data-project-id]').forEach(btn => {
            btn.addEventListener('click', () => abrirModal(btn.dataset.projectId, projetos, categorias));
        });
    }

    // ── MODAL ──────────────────────────────────────────
    function abrirModal(id, projetos, categorias) {
        const p = projetos.find(p => p.id === id);
        if (!p) return;
        const cat = categorias.find(c => c.id === p.categoria_id);

        // Hero
        const img = p.imagem_url || '';
        document.getElementById('modalHero').style.backgroundImage = img ? `url('${img}')` : '';
        document.getElementById('modalTag').textContent = p.subtag || cat?.nome || '';
        document.getElementById('modalTag').style.background = cat ? cat.cor_forte : '';
        document.getElementById('modalTitle').textContent = p.titulo;

        // Meta (local + ano)
        const meta = [p.local, p.ano].filter(Boolean).join(' · ');
        const metaEl = document.getElementById('modalMeta');
        metaEl.innerHTML = meta ? `<i class="fas fa-map-marker-alt"></i>${meta}` : '';

        // Descrição
        const desc = p.descricao || p.resumo || '';
        document.getElementById('modalDescription').innerHTML = desc.replace(/\n/g, '<br>');

        // Indicadores / Métricas
        const metricsSection = document.getElementById('modalMetricsSection');
        const metricsEl = document.getElementById('modalMetrics');
        const indicadores = Array.isArray(p.indicadores) ? p.indicadores.filter(i => i.valor) : [];
        if (indicadores.length) {
            metricsEl.innerHTML = indicadores.map(i =>
                `<div class="modal-metric"><strong>${i.valor}</strong><span>${i.descricao || ''}</span></div>`
            ).join('');
            metricsSection.style.display = '';
        } else {
            metricsSection.style.display = 'none';
        }

        // Parceiros
        const partnersSection = document.getElementById('modalPartnersSection');
        const partnersEl = document.getElementById('modalPartners');
        const parc = p.parceiros || [];
        if (parc.length) {
            partnersEl.innerHTML = parc.map(p => `<span class="modal-partner-tag">${p}</span>`).join('');
            partnersSection.style.display = '';
        } else {
            partnersSection.style.display = 'none';
        }

        // ODS
        const odsSection = document.getElementById('modalOdsSection');
        const odsEl = document.getElementById('modalOds');
        const odsNums = p.ods || [];
        if (odsNums.length) {
            odsEl.innerHTML = odsNums.map(n => {
                const pad = String(n).padStart(2, '0');
                const sfx = n === 1 ? '1' : '0';
                return `<img src="./ODS/${pad}_${sfx}.webp" alt="ODS ${n}" title="ODS ${n}" loading="lazy">`;
            }).join('');
            odsSection.style.display = '';
        } else {
            odsSection.style.display = 'none';
        }

        // Galeria
        const galSection = document.getElementById('modalGaleriaSection');
        const galEl = document.getElementById('modalGaleria');
        const galUrls = p.galeria_urls || [];
        if (galSection && galUrls.length) {
            galEl.innerHTML = galUrls.map((url, i) =>
                `<div class="modal-gal-item" onclick="abrirLightbox('${url}','${p.titulo}')">
                    <img src="${url}" alt="Foto ${i + 1}" loading="lazy">
                </div>`
            ).join('');
            galSection.style.display = '';
        } else if (galSection) {
            galSection.style.display = 'none';
        }

        // Vídeos
        const vidSection = document.getElementById('modalVideoSection');
        const vidEl = document.getElementById('modalVideos');
        const vids = p.video_urls || [];
        if (vidSection && vids.length) {
            vidEl.innerHTML = vids.map(url => {
                const ytId = youtubeId(url);
                if (ytId) {
                    return `<div class="modal-video-embed">
                        <iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0"
                            allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
                            allowfullscreen loading="lazy"></iframe>
                    </div>`;
                }
                return `<a href="${url}" target="_blank" rel="noopener" class="modal-video-link">
                    <i class="fas fa-play-circle"></i> Assistir vídeo</a>`;
            }).join('');
            vidSection.style.display = '';
        } else if (vidSection) {
            vidSection.style.display = 'none';
        }

        // Abrir overlay
        const overlay = document.getElementById('projectModalOverlay');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Scroll to top do modal
        const modal = document.getElementById('projectModal');
        if (modal) modal.scrollTop = 0;
    }

    // ── LIGHTBOX ───────────────────────────────────────
    window.abrirLightbox = function(url, alt) {
        let lb = document.getElementById('lightboxOverlay');
        if (!lb) {
            lb = document.createElement('div');
            lb.id = 'lightboxOverlay';
            lb.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:flex;
                align-items:center;justify-content:center;cursor:zoom-out;padding:20px;backdrop-filter:blur(4px)`;
            lb.onclick = () => lb.remove();
            lb.innerHTML = `<img id="lbImg" style="max-width:100%;max-height:90vh;border-radius:8px;
                object-fit:contain;box-shadow:0 30px 80px rgba(0,0,0,.5)" alt="">
                <button onclick="event.stopPropagation();this.closest('#lightboxOverlay').remove()"
                    style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;
                    color:#fff;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:1.1rem;
                    display:flex;align-items:center;justify-content:center">×</button>`;
            document.body.appendChild(lb);
        }
        document.getElementById('lbImg').src = url;
        document.getElementById('lbImg').alt = alt || '';
    };

    // ── SEARCH INTEGRATION ─────────────────────────────
    // Hooks into the existing search input on projetos.html
    function bindSearch(projetos, categorias) {
        const input = document.getElementById('projectSearch');
        if (!input) return;
        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            if (!q) {
                renderProjetos(projetos, categorias);
                return;
            }
            const filtered = projetos.filter(p =>
                p.titulo.toLowerCase().includes(q) ||
                (p.resumo || '').toLowerCase().includes(q) ||
                (p.subtag || '').toLowerCase().includes(q) ||
                (p.local || '').toLowerCase().includes(q)
            );
            renderProjetos(filtered, categorias);
        });
    }

    // ── MAIN ───────────────────────────────────────────
    try {
        const [categorias, projetos] = await Promise.all([
            sbGet('categorias?order=ordem&select=id,nome,slug,secao,cor_principal,cor_forte,cor_clara'),
            sbGet('projetos?publicado=eq.true&order=ordem&select=id,titulo,subtag,resumo,descricao,categoria_id,imagem_url,galeria_urls,video_urls,ods,indicadores,parceiros,local,ano')
        ]);

        renderProjetos(projetos, categorias);
        bindSearch(projetos, categorias);

        // Remove static fallback HTML now that dynamic content is loaded
        const staticEl = document.getElementById('static-projetos');
        if (staticEl) staticEl.remove();

    } catch (e) {
        // Supabase unavailable — keep static HTML as fallback, hide skeleton
        const container = document.getElementById('projetos-container');
        if (container) container.innerHTML = '';
    }
})();
