(function () {
    var CACHE_KEY = 'adesiap_vis';
    var CACHE_TTL = 5 * 60 * 1000; // 5 min
    var API = '/api/admin/visibilidade';

    // ── Favicon sync ─────────────────────────────────────────────────────────
    var FAV_KEY = 'adesiap_flaticon';
    var FAV_TTL = 24 * 60 * 60 * 1000; // 24h
    var SB_URL  = 'https://vpnqqrzzptuselhiemyp.supabase.co';
    var SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbnFxcnp6cHR1c2VsaGllbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTc1ODksImV4cCI6MjA5ODAzMzU4OX0.kAlFnSeOD_n2JyhFGx9oqiIaqo-IauUIhVmVrRHNeUY';

    function applyFavicon(url) {
        var link = document.querySelector('link[rel="icon"]');
        if (link && url) link.href = url;
    }

    function syncFavicon() {
        try {
            var c = JSON.parse(localStorage.getItem(FAV_KEY) || 'null');
            if (c && Date.now() - c.ts < FAV_TTL) { applyFavicon(c.val); return; }
        } catch(e) {}
        fetch(SB_URL + '/rest/v1/configuracoes?chave=eq.flaticon_url&select=valor', {
            headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
        })
        .then(function(r) { return r.json(); })
        .then(function(rows) {
            var url = rows && rows[0] && rows[0].valor;
            if (url) {
                applyFavicon(url);
                try { localStorage.setItem(FAV_KEY, JSON.stringify({ ts: Date.now(), val: url })); } catch(e) {}
            }
        })
        .catch(function() {});
    }

    // Mapa: chave → arquivo da página
    var PAGE_KEYS = {
        'quem-somos.html':            'pagina_quem-somos',
        'selos-reconhecimentos.html': 'pagina_selos',
        'terceiro-setor.html':        'pagina_terceiro-setor',
        'governanca.html':            'pagina_governanca',
        'agenda-2030.html':           'pagina_agenda-2030',
        'transparencia.html':         'pagina_transparencia',
        'servicos.html':              'pagina_servicos',
        'projetos.html':              'pagina_projetos',
        'doacoes.html':               'pagina_doacoes',
        'seja-parceiro.html':         'pagina_seja-parceiro',
        'ouvidoria.html':             'pagina_ouvidoria',
        'canal-denuncias.html':       'pagina_canal-denuncias',
        'trabalhe-conosco.html':      'pagina_trabalhe-conosco',
        'fale-conosco.html':          'pagina_fale-conosco',
        'cadastro-fornecedores.html': 'pagina_cadastro-fornecedores',
        'politica-privacidade.html':  'pagina_politica-privacidade',
    };

    // Mapa: chave de seção → seletor CSS (somente index.html)
    var SECTION_SEL = {
        // index.html
        'secao_hero':         '.hero',
        'secao_quem-somos':   '#quem-somos',
        'secao_parceiros':    '.partners-section',
        'secao_onde-estamos': '#onde-estamos',
        'secao_impacto':      '#impacto',
        'secao_governanca':   '.governance-section',
        'secao_servicos':     '#servicos',
        'secao_projetos':     '#projetos',
        'secao_noticias':     '#noticias',
        'secao_instagram':    '#instagram',
    };

    // Mapa: chave de página → hrefs que devem ser ocultados no menu/rodapé
    var PAGE_HREFS = {
        'pagina_quem-somos':            ['quem-somos.html'],
        'pagina_selos':                 ['selos-reconhecimentos.html'],
        'pagina_terceiro-setor':        ['terceiro-setor.html'],
        'pagina_governanca':            ['governanca.html'],
        'pagina_agenda-2030':           ['agenda-2030.html'],
        'pagina_transparencia':         ['transparencia.html'],
        'pagina_servicos':              ['servicos.html'],
        'pagina_projetos':              ['projetos.html'],
        'pagina_doacoes':               ['doacoes.html'],
        'pagina_seja-parceiro':         ['seja-parceiro.html'],
        'pagina_ouvidoria':             ['ouvidoria.html'],
        'pagina_canal-denuncias':       ['canal-denuncias.html'],
        'pagina_trabalhe-conosco':      ['trabalhe-conosco.html'],
        'pagina_fale-conosco':          ['fale-conosco.html'],
        'pagina_cadastro-fornecedores': ['cadastro-fornecedores.html'],
        'pagina_politica-privacidade':  ['politica-privacidade.html'],
    };

    // Mapa: chave → { página, seletor } para seções em páginas específicas (fora da index)
    var OTHER_SECTIONS = {
        'secao_ouvidoria-denuncias': { page: 'ouvidoria.html', sel: '#hub-card-denuncias' },
    };

    var filename = (location.pathname.split('/').pop() || 'index.html') || 'index.html';
    var isIndex  = (filename === 'index.html' || filename === '');
    var myKey    = PAGE_KEYS[filename] || null;

    // ── Verifica se o usuário logado é super_admin ───────────────────────────
    function isSuperAdmin() {
        try {
            var session = JSON.parse(localStorage.getItem('adesiap_admin_auth') || 'null');
            var token = session && session.access_token;
            if (!token) return false;
            var parts = token.split('.');
            if (parts.length !== 3) return false;
            var p = JSON.parse(atob(parts[1]));
            return p && p.app_metadata && p.app_metadata.perfil === 'super_admin'
                   && p.exp > Date.now() / 1000;
        } catch (e) { return false; }
    }

    // ── Cache ────────────────────────────────────────────────────────────────
    function getCache() {
        try {
            var c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
            if (c && Date.now() - c.ts < CACHE_TTL) return c.data;
        } catch (e) {}
        return null;
    }

    function setCache(data) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); }
        catch (e) {}
    }

    // ── Redireciona se a página estiver oculta ───────────────────────────────
    function checkPage(data) {
        if (!myKey || data[myKey] !== false || isSuperAdmin()) return;
        document.documentElement.style.visibility = 'hidden';
        location.replace('./index.html');
    }

    // ── Oculta seções da index ───────────────────────────────────────────────
    function applySections(data) {
        if (!isIndex) return;
        Object.keys(SECTION_SEL).forEach(function (key) {
            var el = document.querySelector(SECTION_SEL[key]);
            if (!el) return;
            el.style.display = data[key] === false ? 'none' : '';
        });
    }

    // ── Remove links do menu e rodapé de páginas ocultas ────────────────────
    function applyLinks(data) {
        // Páginas ocultas: remove <a> e <li> pai
        Object.keys(PAGE_HREFS).forEach(function (key) {
            var hidden = data[key] === false;
            PAGE_HREFS[key].forEach(function (href) {
                ['a[href="' + href + '"]', 'a[href="./' + href + '"]'].forEach(function (sel) {
                    document.querySelectorAll(sel).forEach(function (a) {
                        var li = a.closest('li');
                        if (hidden) { if (li) li.style.display = 'none'; else a.style.display = 'none'; }
                        else        { if (li) li.style.removeProperty('display'); else a.style.removeProperty('display'); }
                    });
                });
            });
        });

        // Notícias no menu é uma seção (link #noticias)
        var notiHidden = data['secao_noticias'] === false;
        ['a[href="#noticias"]', 'a[href="index.html#noticias"]'].forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (a) {
                var li = a.closest('li');
                if (notiHidden) { if (li) li.style.display = 'none'; else a.style.display = 'none'; }
                else            { if (li) li.style.removeProperty('display'); else a.style.removeProperty('display'); }
            });
        });

        // Se todos os itens de um dropdown ficarem ocultos, oculta o dropdown pai
        document.querySelectorAll('.dropdown').forEach(function (dd) {
            var items = dd.querySelectorAll(':scope > ul > li');
            if (!items.length) return;
            var allHidden = Array.from(items).every(function (li) { return li.style.display === 'none'; });
            dd.style.display = allHidden ? 'none' : '';
        });
    }

    // ── Oculta seções em páginas específicas (fora da index) ────────────────────
    // Usa só o seletor CSS — se o elemento não existir na página atual, querySelector retorna null
    function applyOtherSections(data) {
        Object.keys(OTHER_SECTIONS).forEach(function (key) {
            var el = document.querySelector(OTHER_SECTIONS[key].sel);
            if (!el) return;
            el.style.display = data[key] === false ? 'none' : '';
        });
    }

    // ── Modo Manutenção ──────────────────────────────────────────────────────
    function checkMaintenance(data) {
        if (data['manutencao_ativa'] !== true || isSuperAdmin()) return;

        // Injeta CSS de animação
        var style = document.createElement('style');
        style.textContent = '@keyframes adesiap-fadein{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}' +
            '@keyframes adesiap-pulse{0%,100%{opacity:.4}50%{opacity:.9}}' +
            '#adesiap-manutencao *{box-sizing:border-box}';
        document.head.appendChild(style);

        // Esconde o conteúdo original
        document.documentElement.style.overflow = 'hidden';

        var el = document.createElement('div');
        el.id = 'adesiap-manutencao';
        el.style.cssText = 'position:fixed;inset:0;z-index:999999;background:linear-gradient(145deg,#0B1F33 0%,#12395D 55%,#1a4f82 100%);display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;';

        el.innerHTML =
            '<div style="text-align:center;max-width:500px;padding:48px 28px;animation:adesiap-fadein .6s ease both">' +

            // Logo
            '<img src="./ADESIAP MINAS BRANCA.png" alt="ADESIAP Minas"' +
            ' style="height:52px;margin-bottom:48px;opacity:.95;filter:drop-shadow(0 2px 12px rgba(0,0,0,.3))"' +
            ' onerror="this.style.display=\'none\'">' +

            // Ícone animado
            '<div style="width:80px;height:80px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 32px;font-size:2.2rem;animation:adesiap-pulse 2.4s ease-in-out infinite">' +
            '<i class="fas fa-tools" style="color:rgba(255,255,255,.75)"></i>' +
            '</div>' +

            // Título
            '<h1 style="color:#fff;font-size:2rem;font-weight:700;margin:0 0 14px;letter-spacing:-.03em;line-height:1.2">' +
            'Site em Manutenção' +
            '</h1>' +

            // Descrição
            '<p style="color:rgba(255,255,255,.6);font-size:1rem;line-height:1.75;margin:0 0 48px">' +
            'Estamos realizando melhorias para oferecer<br>uma experiência ainda melhor.<br>' +
            '<span style="color:rgba(255,255,255,.85);font-weight:600">Voltaremos em breve!</span>' +
            '</p>' +

            // Divider
            '<div style="width:40px;height:2px;background:rgba(255,255,255,.15);margin:0 auto 32px;border-radius:2px"></div>' +

            // Contato
            '<div style="display:inline-flex;align-items:center;gap:10px;padding:12px 22px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:50px">' +
            '<i class="fas fa-envelope" style="color:rgba(255,255,255,.4);font-size:.85rem"></i>' +
            '<a href="mailto:contato@adesiap.org.br" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;font-family:Inter,sans-serif">contato@adesiap.org.br</a>' +
            '</div>' +

            '</div>';

        document.body.appendChild(el);
    }

    function applyAll(data) {
        checkMaintenance(data);
        checkPage(data);
        applySections(data);
        applyOtherSections(data);
        applyLinks(data);
    }

    // ── Execução ─────────────────────────────────────────────────────────────
    var cached = getCache();
    if (cached) checkPage(cached); // redireciona imediatamente se oculta (usa cache)

    function run() {
        syncFavicon();
        if (cached) applyAll(cached);
        fetch(API)
            .then(function (r) { return r.json(); })
            .then(function (data) { setCache(data); applyAll(data); })
            .catch(function () {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
