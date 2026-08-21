// Mobile dropdown: tap opens submenu; submenu items navigate normally
(function () {
    var style = document.createElement('style');
    style.textContent = [
        '@media (max-width: 991px) {',
        '  .dropdown > a > i.fa-chevron-down { transition: transform 0.3s; display: inline-block; }',
        '  .dropdown:hover > .dropdown-menu { display: none !important; }',
        '  .dropdown.open > a > i.fa-chevron-down { transform: rotate(180deg); }',
        '  .dropdown.open > .dropdown-menu {',
        '    display: flex !important;',
        '    flex-direction: column;',
        '    position: static !important;',
        '    box-shadow: none !important;',
        '    background: rgba(245,242,238,0.6);',
        '    border-radius: 0 0 6px 6px;',
        '    padding: 4px 0 8px 16px;',
        '    border-left: 3px solid var(--terracota-institucional, #c0614a);',
        '    min-width: unset !important;',
        '    width: 100%;',
        '    margin-top: 0;',
        '  }',
        '  .dropdown.open > .dropdown-menu li a {',
        '    font-size: 1rem !important;',
        '    padding: 10px 0 !important;',
        '    border-bottom: 1px solid rgba(0,0,0,0.07);',
        '  }',
        '}'
    ].join('\n');
    document.head.appendChild(style);

    function initDropdowns() {
        // Attach CAPTURE-phase listeners directly to each dropdown parent <a>.
        // Capture on the element fires before any target-phase listener added earlier
        // (e.g. the menu-close handlers in inline page scripts).
        document.querySelectorAll('.dropdown > a').forEach(function (a) {
            a.addEventListener('click', function (e) {
                if (window.innerWidth > 991) return;
                e.preventDefault();
                e.stopImmediatePropagation(); // also stops sibling handlers on this element
                var dropdown = a.parentElement;
                var isOpen = dropdown.classList.contains('open');
                var list = dropdown.parentElement;
                if (list) {
                    list.querySelectorAll('.dropdown.open').forEach(function (d) {
                        d.classList.remove('open');
                    });
                }
                if (!isOpen) dropdown.classList.add('open');
            }, true); // true = capture phase on the element
        });

        // Collapse open dropdowns when hamburger closes the menu
        var hamburger = document.getElementById('mobile-menu-btn');
        if (hamburger) {
            hamburger.addEventListener('click', function () {
                document.querySelectorAll('.dropdown.open').forEach(function (d) {
                    d.classList.remove('open');
                });
            });
        }
    }

    // defer scripts run after HTML parsing (readyState is 'interactive')
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }
})();
