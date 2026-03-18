/* ================================================================
   LOUWIETEC — Main JavaScript
   Scroll animations, navigation state, nothing more.
   ================================================================ */

(function () {
    'use strict';

    /* ── Navigation scroll state ───────────────────────────── */

    function initNavigation() {
        var nav = document.querySelector('.nav');
        if (!nav) return;

        function updateNav() {
            if (window.scrollY > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }

        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();
    }

    /* ── Scroll-triggered fade-in ──────────────────────────── */

    function initFadeIn() {
        var elements = document.querySelectorAll('.fade-in');
        if (!elements.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px',
            }
        );

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ── Smooth scroll for anchor links ────────────────────── */

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;

                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* ── Initialize ────────────────────────────────────────── */

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initFadeIn();
        initSmoothScroll();
    });
})();
