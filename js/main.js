/* ================================================================
   LOUWIETEC V2 — Main JavaScript
   Scroll animations, countUp, hero effects, navigation state.
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

    /* ── Scroll-triggered data-animate ─────────────────────── */

    function initAnimations() {
        var elements = document.querySelectorAll('[data-animate]');
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
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            }
        );

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ── CountUp animation for numbers section ─────────────── */

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function countUp(el, target, duration) {
        var start = performance.now();

        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var easedProgress = easeOutExpo(progress);
            var current = Math.round(easedProgress * target);

            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(tick);
    }

    function initCountUp() {
        var numberValues = document.querySelectorAll('[data-count]');
        if (!numberValues.length) return;

        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var target = parseInt(el.getAttribute('data-count'), 10);
                        var suffix = el.getAttribute('data-suffix') || '';

                        // "0 €" edge case — display statically, don't animate
                        if (target === 0) {
                            el.textContent = '0';
                            if (suffix) {
                                el.innerHTML = '0' + suffix;
                            }
                            observer.unobserve(el);
                            return;
                        }

                        countUp(el, target, 1800);

                        // After animation, append suffix if present
                        if (suffix) {
                            setTimeout(function () {
                                el.innerHTML = target + suffix;
                            }, 1850);
                        }

                        observer.unobserve(el);
                    }
                });
            },
            {
                threshold: 0.3
            }
        );

        numberValues.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ── Hero letter-spacing animation ─────────────────────── */

    function initHeroAnimation() {
        var heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        // Trigger after hero reveal animation completes
        setTimeout(function () {
            heroTitle.classList.add('letter-spacing-animated');
        }, 1200);
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
        initAnimations();
        initCountUp();
        initHeroAnimation();
        initSmoothScroll();
    });
})();
