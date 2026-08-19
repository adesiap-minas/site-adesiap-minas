(function () {
    if (localStorage.getItem('adesiap_cookies') === 'ok') return;

    var style = document.createElement('style');
    style.textContent = [
        '#ck-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;',
        'background:#12395D;color:#fff;padding:14px 28px;display:flex;',
        'align-items:center;justify-content:space-between;gap:20px;',
        'font-family:"Inter",sans-serif;font-size:.86rem;line-height:1.5;',
        'box-shadow:0 -4px 24px rgba(0,0,0,.28);',
        'transform:translateY(100%);transition:transform .4s ease;}',
        '#ck-banner.ck-show{transform:translateY(0);}',
        '#ck-banner p{margin:0;max-width:780px;}',
        '#ck-banner a{color:#93c5fd;text-decoration:underline;}',
        '#ck-btn{background:#B21F1F;color:#fff;border:none;padding:10px 22px;',
        'border-radius:6px;font-size:.84rem;font-weight:600;cursor:pointer;',
        'white-space:nowrap;font-family:"Inter",sans-serif;flex-shrink:0;}',
        '#ck-btn:hover{background:#901818;}',
        '@media(max-width:600px){#ck-banner{flex-direction:column;align-items:flex-start;}}'
    ].join('');
    document.head.appendChild(style);

    var banner = document.createElement('div');
    banner.id = 'ck-banner';
    banner.innerHTML =
        '<p>Este site utiliza apenas cookies essenciais para seu funcionamento. ' +
        'Nenhum dado é compartilhado com terceiros para fins publicitários. ' +
        'Saiba mais na nossa <a href="/politica-privacidade.html">Política de Privacidade</a>.</p>' +
        '<button id="ck-btn">Entendi ✓</button>';
    document.body.appendChild(banner);

    document.getElementById('ck-btn').addEventListener('click', function () {
        localStorage.setItem('adesiap_cookies', 'ok');
        banner.style.transform = 'translateY(100%)';
        setTimeout(function () { banner.remove(); }, 420);
    });

    requestAnimationFrame(function () {
        requestAnimationFrame(function () { banner.classList.add('ck-show'); });
    });
})();
