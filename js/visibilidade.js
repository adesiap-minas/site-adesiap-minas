(function () {
    var CACHE_KEY = 'adesiap_vis';
    var CACHE_TTL = 5 * 60 * 1000; // 5 min
    var API = '/api/admin/visibilidade';

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
    function applyOtherSections(data) {
        Object.keys(OTHER_SECTIONS).forEach(function (key) {
            var cfg = OTHER_SECTIONS[key];
            if (filename !== cfg.page) return;
            var el = document.querySelector(cfg.sel);
            if (!el) return;
            el.style.display = data[key] === false ? 'none' : '';
        });
    }

    function applyAll(data) {
        checkPage(data);
        applySections(data);
        applyOtherSections(data);
        applyLinks(data);
    }

    // ── Execução ─────────────────────────────────────────────────────────────
    var cached = getCache();
    if (cached) checkPage(cached); // redireciona imediatamente se oculta (usa cache)

    function run() {
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
