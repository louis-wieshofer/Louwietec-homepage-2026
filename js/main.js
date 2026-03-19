/* ================================================================
   LOUWIETEC V3 — Main JavaScript
   NetworkGrid canvas, scroll animations, countUp, nav state.
   ================================================================ */

(function () {
    'use strict';

    /* ── NetworkGrid — animated dot-grid canvas ────────────── */

    function NetworkGrid(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.frame = 0;
        this.opacity = 1;
        this.isMobile = window.innerWidth < 768;
        this.isSmall = window.innerWidth < 480;
        this.resize();
        this.init();
        this.resizeTimer = null;
        var self = this;
        window.addEventListener('resize', function () {
            clearTimeout(self.resizeTimer);
            self.resizeTimer = setTimeout(function () {
                self.isMobile = window.innerWidth < 768;
                self.isSmall = window.innerWidth < 480;
                self.resize();
                self.init();
            }, 200);
        });
        window.addEventListener('scroll', function () {
            self.opacity = Math.max(0.15, 1 - window.scrollY / 2000);
        }, { passive: true });
        this.loop();
    }

    NetworkGrid.prototype.resize = function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };

    NetworkGrid.prototype.init = function () {
        var count = this.isMobile ? 80 : 180;
        this.points = [];
        for (var i = 0; i < count; i++) {
            var isGold = Math.random() < 0.15;
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                phase: Math.random() * Math.PI * 2,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                color: isGold
                    ? 'rgba(184, 149, 42, 0.08)'
                    : 'rgba(255, 255, 255, 0.07)'
            });
        }
    };

    NetworkGrid.prototype.loop = function () {
        var self = this;
        var ctx = this.ctx;
        var w = this.canvas.width;
        var h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = this.opacity;

        this.frame++;
        var pts = this.points;

        for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            p.x += Math.sin(this.frame * 0.005 + p.phase) * p.speedX;
            p.y += Math.cos(this.frame * 0.005 + p.phase) * p.speedY;

            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        if (!this.isSmall) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
            ctx.lineWidth = 0.5;
            for (var i = 0; i < pts.length; i++) {
                for (var j = i + 1; j < pts.length; j++) {
                    var dx = pts[i].x - pts[j].x;
                    var dy = pts[i].y - pts[j].y;
                    if (dx * dx + dy * dy < 14400) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(function () { self.loop(); });
    };

    /* ── ScrollObserver — data-animate system ──────────────── */

    function initScrollObserver() {
        var elements = document.querySelectorAll('[data-animate]');
        if (!elements.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var delay = entry.target.getAttribute('data-delay');
                    if (delay) {
                        entry.target.style.transitionDelay = delay;
                    }
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(function (el) { observer.observe(el); });
    }

    /* ── CountUp ───────────────────────────────────────────── */

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function countUp(el, target, duration) {
        var start = performance.now();
        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            el.textContent = Math.round(easeOutExpo(progress) * target);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    function initCountUp() {
        var els = document.querySelectorAll('[data-count]');
        if (!els.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    var target = parseInt(el.getAttribute('data-count'), 10);
                    var suffix = el.getAttribute('data-suffix') || '';

                    if (target === 0) {
                        el.innerHTML = '0' + suffix;
                        observer.unobserve(el);
                        return;
                    }

                    countUp(el, target, 1500);
                    if (suffix) {
                        setTimeout(function () { el.innerHTML = target + suffix; }, 1550);
                    }
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        els.forEach(function (el) { observer.observe(el); });
    }

    /* ── Nav scroll state ──────────────────────────────────── */

    function initNav() {
        var nav = document.querySelector('.nav');
        if (!nav) return;
        function update() {
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* ── Smooth scroll + thesis glow ───────────────────────── */

    function initExtras() {
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                var id = this.getAttribute('href');
                if (id === '#') return;
                var target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        var accent = document.querySelector('.thesis-accent');
        if (accent) {
            var obs = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    accent.classList.add('glow-pulse');
                    obs.unobserve(accent);
                }
            }, { threshold: 0.5 });
            obs.observe(accent);
        }
    }

    /* ── Initialize ────────────────────────────────────────── */

    document.addEventListener('DOMContentLoaded', function () {
        var canvas = document.getElementById('network-grid');
        if (canvas) new NetworkGrid(canvas);

        initScrollObserver();
        initCountUp();
        initNav();
        initExtras();
    });
})();
