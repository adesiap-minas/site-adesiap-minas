// Mobile dropdown: tap opens submenu; submenu items navigate normally
(function () {
    // CSS for mobile dropdown
    var style = document.createElement('style');
    style.textContent = [
        '@media (max-width: 991px) {',
        '  .dropdown > a > i.fa-chevron-down { transition: transform 0.3s; display: inline-block; }',
        '  .dropdown:hover > .dropdown-menu { display: none; }',
        '  .dropdown.open > a > i.fa-chevron-down { transform: rotate(180deg); }',
        '  .dropdown.open > .dropdown-menu {',
        '    display: flex !important;',
        '    flex-direction: column;',
        '    position: static;',
        '    box-shadow: none;',
        '    background: rgba(245,242,238,0.6);',
        '    border-radius: 0 0 6px 6px;',
        '    padding: 4px 0 8px 16px;',
        '    border-left: 3px solid var(--terracota-institucional, #c0614a);',
        '    min-width: unset;',
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

    // CAPTURE PHASE — fires before any element-level listener or bubbling handler.
    // This intercepts the click at the top of the event chain, preventing navigation
    // on dropdown parents regardless of what other scripts do.
    document.addEventListener('click', function (e) {
        if (window.innerWidth > 991) return;

        // Walk up from the clicked target to find a .dropdown > a
        var link = e.target;
        while (link && link !== document) {
            if (link.tagName === 'A' && link.parentElement && link.parentElement.classList.contains('dropdown')) break;
            link = link.parentElement;
        }
        if (!link || link === document) return;

        // It's a dropdown parent link — block navigation and toggle submenu
        e.preventDefault();
        e.stopPropagation();

        var dropdown = link.parentElement;
        var isOpen = dropdown.classList.contains('open');
        // Collapse all open dropdowns in the same list
        var list = dropdown.parentElement;
        if (list) {
            list.querySelectorAll('.dropdown.open').forEach(function (d) {
                d.classList.remove('open');
            });
        }
        if (!isOpen) dropdown.classList.add('open');

    }, true); // true = capture phase

    // Collapse open dropdowns when hamburger closes the menu
    document.addEventListener('DOMContentLoaded', function () {
        var hamburger = document.getElementById('mobile-menu-btn');
        var mainMenu = document.querySelector('.main-menu');
        if (hamburger && mainMenu) {
            hamburger.addEventListener('click', function () {
                mainMenu.querySelectorAll('.dropdown.open').forEach(function (d) {
                    d.classList.remove('open');
                });
            });
        }
    });
})();
