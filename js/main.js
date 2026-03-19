/* ================================================================
   LOUWIETEC V4 — Main JavaScript
   Modules: Preloader, NetworkGrid, MonogramParticles, CustomCursor,
   initMagnetic, initScrollEffects, init (Lenis + orchestration)
   ================================================================ */

(function () {
    'use strict';

    /* ── Preloader ─────────────────────────────────────────── */

    function Preloader(callback) {
        var el = document.getElementById('preloader');
        if (!el) { callback(); return; }

        // Step 1: monogram fade (handled by CSS animation at 0.1s)
        // Step 2: gold line (handled by CSS animation at 0.6s)
        // Step 3: split panels (handled by CSS animation at 1.2s)
        // Step 4: cleanup + dispatch event
        setTimeout(function () {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.3s ease';
            document.body.classList.remove('loading');

            setTimeout(function () {
                el.remove();
                document.dispatchEvent(new CustomEvent('preloader:done'));
                callback();
            }, 300);
        }, 2100);
    }

    /* ── NetworkGrid — animated dot-grid canvas ────────────── */

    function NetworkGrid(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.frame = 0;
        this.opacity = 1;
        this.parallaxOffset = 0;
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

        ctx.save();
        ctx.translate(0, this.parallaxOffset);

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

        ctx.restore();
        ctx.globalAlpha = 1;
        requestAnimationFrame(function () { self.loop(); });
    };

    /* ── MonogramParticles — gold orbiting dots ────────────── */

    function MonogramParticles(canvas) {
        if (!canvas) return;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.frame = 0;

        for (var i = 0; i < 25; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                radiusX: 60 + Math.random() * 30,
                radiusY: 50 + Math.random() * 30,
                speed: 0.001 + Math.random() * 0.002,
                opacity: 0.1 + Math.random() * 0.2,
                size: 1 + Math.random() * 1.5
            });
        }
        this.loop();
    }

    MonogramParticles.prototype.loop = function () {
        var self = this;
        var ctx = this.ctx;
        var cx = this.canvas.width / 2;
        var cy = this.canvas.height / 2;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frame++;

        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
            p.angle += p.speed;
            var x = cx + Math.cos(p.angle) * p.radiusX;
            var y = cy + Math.sin(p.angle) * p.radiusY;

            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(184, 149, 42, ' + p.opacity + ')';
            ctx.fill();
        }

        requestAnimationFrame(function () { self.loop(); });
    };

    /* ── CustomCursor ──────────────────────────────────────── */

    function CustomCursor() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        var outer = document.getElementById('cursor-outer');
        var inner = document.getElementById('cursor-inner');
        if (!outer || !inner) return;

        document.body.classList.add('has-custom-cursor');

        var mx = 0, my = 0;
        var ox = 0, oy = 0;
        var visible = false;

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
            inner.style.left = mx + 'px';
            inner.style.top = my + 'px';
            if (!visible) {
                visible = true;
                outer.style.opacity = '1';
                inner.style.opacity = '1';
            }
        });

        document.addEventListener('mouseleave', function () {
            visible = false;
            outer.style.opacity = '0';
            inner.style.opacity = '0';
        });

        // Hover detection
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest('a, button, [data-magnetic]')) {
                outer.classList.add('cursor-outer--hover');
            }
        });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest('a, button, [data-magnetic]')) {
                outer.classList.remove('cursor-outer--hover');
            }
        });

        // Lerp loop for outer ring
        function lerp() {
            ox += (mx - ox) * 0.15;
            oy += (my - oy) * 0.15;
            outer.style.left = ox + 'px';
            outer.style.top = oy + 'px';
            requestAnimationFrame(lerp);
        }
        lerp();
    }

    /* ── Magnetic Elements ─────────────────────────────────── */

    function initMagnetic() {
        if (window.matchMedia('(pointer: coarse)').matches) return;

        var els = document.querySelectorAll('[data-magnetic]');
        els.forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var rect = el.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = 'translate(' + (x * 0.2) + 'px, ' + (y * 0.2) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = 'translate(0, 0)';
            });
        });
    }

    /* ── Scroll Effects ────────────────────────────────────── */

    function initScrollEffects() {

        // Text reveal
        var reveals = document.querySelectorAll('[data-reveal]');
        if (reveals.length) {
            var revealObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        revealObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });
            reveals.forEach(function (el) { revealObs.observe(el); });
        }

        // Fade animations (data-animate)
        var animates = document.querySelectorAll('[data-animate]');
        if (animates.length) {
            var animObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var delay = entry.target.getAttribute('data-delay');
                        if (delay) {
                            entry.target.style.transitionDelay = delay;
                        }
                        entry.target.classList.add('in-view');
                        animObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
            animates.forEach(function (el) { animObs.observe(el); });
        }

        // Section dividers
        var dividers = document.querySelectorAll('.section-divider');
        if (dividers.length) {
            var divObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        divObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            dividers.forEach(function (el) { divObs.observe(el); });
        }

        // CountUp
        var countEls = document.querySelectorAll('[data-count]');
        if (countEls.length) {
            var countObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var target = parseInt(el.getAttribute('data-count'), 10);
                        var suffix = el.getAttribute('data-suffix') || '';

                        if (target === 0) {
                            el.innerHTML = '0' + suffix;
                            countObs.unobserve(el);
                            return;
                        }

                        var start = performance.now();
                        var duration = 1500;
                        function tick(now) {
                            var elapsed = now - start;
                            var progress = Math.min(elapsed / duration, 1);
                            var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                            el.textContent = Math.round(eased * target);
                            if (progress < 1) requestAnimationFrame(tick);
                            else el.innerHTML = target + suffix;
                        }
                        requestAnimationFrame(tick);
                        countObs.unobserve(el);
                    }
                });
            }, { threshold: 0.5 });
            countEls.forEach(function (el) { countObs.observe(el); });
        }

        // Card glow (cursor-following gradient)
        if (!window.matchMedia('(pointer: coarse)').matches) {
            var cards = document.querySelectorAll('.glass-card');
            cards.forEach(function (card) {
                card.addEventListener('mousemove', function (e) {
                    var rect = card.getBoundingClientRect();
                    var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
                    var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
                    card.style.setProperty('--glow-x', x + '%');
                    card.style.setProperty('--glow-y', y + '%');
                    card.style.setProperty('--card-glow', 'rgba(184, 149, 42, 0.06)');
                });
                card.addEventListener('mouseleave', function () {
                    card.style.setProperty('--card-glow', 'transparent');
                });
            });
        }

        // Thesis glow pulse
        var accent = document.querySelector('.thesis-accent');
        if (accent) {
            var thesisObs = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) {
                    accent.classList.add('glow-pulse');
                    thesisObs.unobserve(accent);
                }
            }, { threshold: 0.5 });
            thesisObs.observe(accent);
        }
    }

    /* ── Init — DOMContentLoaded ───────────────────────────── */

    document.addEventListener('DOMContentLoaded', function () {

        // NetworkGrid
        var gridCanvas = document.getElementById('network-grid');
        var grid = gridCanvas ? new NetworkGrid(gridCanvas) : null;

        // MonogramParticles
        var particleCanvas = document.getElementById('monogram-particles');
        if (particleCanvas) new MonogramParticles(particleCanvas);

        // Custom cursor
        new CustomCursor();

        // Magnetic elements
        initMagnetic();

        // Lenis smooth scroll
        var lenis = null;
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 1.2,
                easing: function (t) { return 1 - Math.pow(2, -10 * t); } // easeOutExpo
            });

            var nav = document.querySelector('.nav');
            var progressBar = document.getElementById('scroll-progress');
            var orbs = document.querySelectorAll('.gradient-orb');

            lenis.on('scroll', function (e) {
                var scrollY = e.scroll;
                var limit = e.limit;

                // Parallax: grid at 0.3x
                if (grid) {
                    grid.parallaxOffset = scrollY * 0.3;
                    grid.opacity = Math.max(0.15, 1 - scrollY / 2000);
                }

                // Parallax: orbs at 0.5x via CSS variable
                var orbOffset = (scrollY * 0.5) + 'px';
                orbs.forEach(function (orb) {
                    orb.style.setProperty('--parallax-orb', orbOffset);
                });

                // Scroll progress bar
                if (progressBar && limit > 0) {
                    progressBar.style.width = ((scrollY / limit) * 100) + '%';
                }

                // Nav scrolled state
                if (nav) {
                    nav.classList.toggle('scrolled', scrollY > 50);
                }
            });

            // rAF loop for Lenis
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            // Anchor links via lenis.scrollTo
            document.querySelectorAll('a[href^="#"]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var href = this.getAttribute('href');
                    if (href === '#') return;
                    var target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        lenis.scrollTo(target);
                    }
                });
            });
        } else {
            // Fallback: no Lenis — basic scroll handling
            var nav = document.querySelector('.nav');
            var progressBar = document.getElementById('scroll-progress');

            window.addEventListener('scroll', function () {
                var scrollY = window.scrollY;

                if (grid) {
                    grid.parallaxOffset = scrollY * 0.3;
                    grid.opacity = Math.max(0.15, 1 - scrollY / 2000);
                }

                var orbs = document.querySelectorAll('.gradient-orb');
                var orbOffset = (scrollY * 0.5) + 'px';
                orbs.forEach(function (orb) {
                    orb.style.setProperty('--parallax-orb', orbOffset);
                });

                if (progressBar) {
                    var limit = document.documentElement.scrollHeight - window.innerHeight;
                    if (limit > 0) {
                        progressBar.style.width = ((scrollY / limit) * 100) + '%';
                    }
                }

                if (nav) {
                    nav.classList.toggle('scrolled', scrollY > 50);
                }
            }, { passive: true });

            // Anchor links fallback
            document.querySelectorAll('a[href^="#"]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var href = this.getAttribute('href');
                    if (href === '#') return;
                    var target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        }

        // Preloader → Hero chain
        var hero = document.querySelector('.hero');
        new Preloader(function () {
            if (hero) {
                hero.classList.add('hero--animate');
            }
            // Trigger scroll effects after preloader
            initScrollEffects();
        });
    });
})();
