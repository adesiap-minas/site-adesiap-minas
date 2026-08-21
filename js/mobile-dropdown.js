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

    function getDropdownLinks() {
        return document.querySelectorAll('.dropdown > a');
    }

    // Remove href on mobile so the link cannot navigate; restore on desktop
    function patchHrefs() {
        var mobile = window.innerWidth <= 991;
        getDropdownLinks().forEach(function (a) {
            if (mobile) {
                if (a.getAttribute('href') && !a.dataset.mobileHref) {
                    a.dataset.mobileHref = a.getAttribute('href');
                    a.removeAttribute('href');
                    a.style.cursor = 'pointer';
                }
            } else {
                if (a.dataset.mobileHref) {
                    a.setAttribute('href', a.dataset.mobileHref);
                    delete a.dataset.mobileHref;
                    a.style.cursor = '';
                }
            }
        });
    }

    function initDropdowns() {
        var mainMenu = document.querySelector('.main-menu');

        // When hamburger closes the menu, also collapse any open dropdowns
        var hamburger = document.getElementById('mobile-menu-btn');
        if (hamburger && mainMenu) {
            hamburger.addEventListener('click', function () {
                mainMenu.querySelectorAll('.dropdown.open').forEach(function (d) {
                    d.classList.remove('open');
                });
            });
        }

        // Patch hrefs now and on every resize
        patchHrefs();
        window.addEventListener('resize', patchHrefs);

        // Toggle dropdown on click (link has no href on mobile, so no navigation risk)
        getDropdownLinks().forEach(function (link) {
            link.addEventListener('click', function (e) {
                if (window.innerWidth > 991) return;
                e.preventDefault();
                var dropdown = link.parentElement;
                var isOpen = dropdown.classList.contains('open');
                // Close all open dropdowns in the same container
                var container = dropdown.parentElement;
                if (container) {
                    container.querySelectorAll('.dropdown.open').forEach(function (d) {
                        d.classList.remove('open');
                    });
                }
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
