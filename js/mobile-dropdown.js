// Mobile dropdown: first tap opens submenu, second tap (on submenu item) navigates
(function () {
    // Inject CSS for mobile dropdown open state
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

    function initDropdowns() {
        var mainMenu = document.querySelector('.main-menu');
        if (!mainMenu) return;

        // When hamburger closes the menu, also collapse any open dropdowns
        var hamburger = document.getElementById('mobile-menu-btn');
        if (hamburger) {
            hamburger.addEventListener('click', function () {
                mainMenu.querySelectorAll('.dropdown.open').forEach(function (d) {
                    d.classList.remove('open');
                });
            });
        }

        // Intercept dropdown parent links on mobile
        mainMenu.querySelectorAll('.dropdown > a').forEach(function (link) {
            link.addEventListener('click', function (e) {
                if (window.innerWidth > 991) return;
                e.preventDefault();
                e.stopImmediatePropagation();
                var dropdown = link.parentElement;
                var isOpen = dropdown.classList.contains('open');
                mainMenu.querySelectorAll('.dropdown.open').forEach(function (d) {
                    d.classList.remove('open');
                });
                if (!isOpen) dropdown.classList.add('open');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }
})();
