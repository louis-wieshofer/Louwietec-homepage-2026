/* ================================================================
   LOUWIETEC V6 — Main JavaScript (Shared, Multi-Page)
   17 Modules: Preloader, NetworkGrid, GradientMesh, MonogramParticles,
   CustomCursor, CardTilt, CardGlow, MagneticElements,
   TypingEffect, NumberReveal, HorizontalScroll, ScrollAnimations,
   SoundDesign, EasterEgg, MonogramGlow, MobileMenu, ActiveNav
   + Init orchestration (page-aware)
   ================================================================ */

(function () {
    'use strict';

    /* ── Preloader (homepage only) ─────────────────────────── */

    function Preloader(callback) {
        var el = document.getElementById('preloader');
        if (!el) { callback(); return; }
        setTimeout(function () {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.3s ease';
            document.body.classList.remove('loading');
            setTimeout(function () {
                el.remove();
                callback();
            }, 300);
        }, 2100);
    }

    /* ── NetworkGrid ───────────────────────────────────────── */

    function NetworkGrid(canvas, inverted) {
        if (!canvas) return;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.frame = 0;
        this.opacity = 1;
        this.parallaxOffset = 0;
        this.inverted = !!inverted;
        this.isMobile = window.innerWidth < 768;
        this.isSmall = window.innerWidth < 480;
        this.resize();
        this.init();
        var self = this;
        this._onResize = function () {
            clearTimeout(self._rt);
            self._rt = setTimeout(function () {
                self.isMobile = window.innerWidth < 768;
                self.isSmall = window.innerWidth < 480;
                self.resize();
                self.init();
            }, 200);
        };
        window.addEventListener('resize', this._onResize);
        this.loop();
    }

    NetworkGrid.prototype.resize = function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    };

    NetworkGrid.prototype.init = function () {
        var count = this.isMobile ? 80 : 200;
        this.points = [];
        for (var i = 0; i < count; i++) {
            // 12% are "hub" nodes — larger, brighter, slower (like key AI nodes)
            var isHub = Math.random() < 0.12;
            // 20% are accent-colored (bright blue), rest are cool white
            var isAccent = Math.random() < 0.2;
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                phase: Math.random() * Math.PI * 2,
                speedX: (Math.random() - 0.5) * (isHub ? 0.15 : 0.3),
                speedY: (Math.random() - 0.5) * (isHub ? 0.15 : 0.3),
                isHub: isHub,
                radius: isHub ? (2.5 + Math.random() * 1.5) : (1.2 + Math.random() * 0.8),
                color: this.inverted
                    ? (isAccent ? 'rgba(70,140,220,' : 'rgba(60,60,80,')
                    : (isAccent ? 'rgba(70,140,220,' : 'rgba(180,200,230,'),
                baseAlpha: isHub ? (0.5 + Math.random() * 0.3) : (0.15 + Math.random() * 0.15),
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    };

    NetworkGrid.prototype.loop = function () {
        var self = this;
        if (document.hidden) { requestAnimationFrame(function () { self.loop(); }); return; }
        var ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = this.opacity;
        ctx.save();
        ctx.translate(0, this.parallaxOffset);
        this.frame++;
        var pts = this.points;
        var t = this.frame * 0.005;

        // Draw connections first (behind nodes)
        var connColor = this.inverted ? 'rgba(60,60,80,' : 'rgba(70,140,220,';
        if (!this.isSmall) {
            ctx.lineWidth = 0.8;
            for (var j = 0; j < pts.length; j++) {
                for (var k = j + 1; k < pts.length; k++) {
                    var dx = pts[j].x - pts[k].x, dy = pts[j].y - pts[k].y;
                    var distSq = dx * dx + dy * dy;
                    var maxDist = (pts[j].isHub || pts[k].isHub) ? 40000 : 25600;
                    if (distSq < maxDist) {
                        var alpha = (1 - distSq / maxDist) * 0.22;
                        ctx.strokeStyle = connColor + alpha.toFixed(3) + ')';
                        ctx.beginPath();
                        ctx.moveTo(pts[j].x, pts[j].y);
                        ctx.lineTo(pts[k].x, pts[k].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Draw nodes
        for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            p.x += Math.sin(t + p.phase) * p.speedX;
            p.y += Math.cos(t + p.phase) * p.speedY;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

            // Hub nodes pulse gently
            var alpha = p.baseAlpha;
            if (p.isHub) {
                alpha += Math.sin(this.frame * 0.02 + p.pulsePhase) * 0.1;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.max(0.05, alpha).toFixed(3) + ')';
            ctx.fill();

            // Hub glow
            if (p.isHub) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(70,140,220,' + (alpha * 0.15).toFixed(3) + ')';
                ctx.fill();
            }
        }

        ctx.restore();
        ctx.globalAlpha = 1;
        requestAnimationFrame(function () { self.loop(); });
    };

    /* ── GradientMesh (homepage hero) ──────────────────────── */

    function GradientMesh(canvas) {
        if (!canvas) return;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.frame = 0;
        this.blobs = [];
        for (var i = 0; i < 4; i++) {
            this.blobs.push({
                x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6,
                phaseX: Math.random() * Math.PI * 2, phaseY: Math.random() * Math.PI * 2,
                speedX: 0.003 + Math.random() * 0.004, speedY: 0.002 + Math.random() * 0.005,
                radius: 0.15 + Math.random() * 0.15, opacity: 0.02 + Math.random() * 0.02
            });
        }
        this.resize();
        var self = this;
        window.addEventListener('resize', function () { self.resize(); });
        this.loop();
    }

    GradientMesh.prototype.resize = function () {
        var p = this.canvas.parentElement;
        if (p) { this.canvas.width = p.offsetWidth; this.canvas.height = p.offsetHeight; }
    };

    GradientMesh.prototype.loop = function () {
        var self = this;
        if (document.hidden) { requestAnimationFrame(function () { self.loop(); }); return; }
        var ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        this.frame++;
        for (var i = 0; i < this.blobs.length; i++) {
            var b = this.blobs[i];
            var cx = (b.x + Math.sin(this.frame * b.speedX + b.phaseX) * 0.2) * w;
            var cy = (b.y + Math.cos(this.frame * b.speedY + b.phaseY) * 0.2) * h;
            var r = b.radius * Math.min(w, h);
            var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            grad.addColorStop(0, 'rgba(70,140,220,' + b.opacity + ')');
            grad.addColorStop(1, 'rgba(70,140,220,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
        requestAnimationFrame(function () { self.loop(); });
    };

    /* ── MonogramParticles (homepage) ──────────────────────── */

    function MonogramParticles(canvas) {
        if (!canvas) return;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.frame = 0;
        for (var i = 0; i < 25; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                radiusX: 60 + Math.random() * 30, radiusY: 50 + Math.random() * 30,
                speed: 0.001 + Math.random() * 0.002,
                opacity: 0.1 + Math.random() * 0.2,
                size: 1 + Math.random() * 1.5
            });
        }
        this.loop();
    }

    MonogramParticles.prototype.loop = function () {
        var self = this;
        if (document.hidden) { requestAnimationFrame(function () { self.loop(); }); return; }
        var ctx = this.ctx, cx = this.canvas.width / 2, cy = this.canvas.height / 2;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frame++;
        for (var i = 0; i < this.particles.length; i++) {
            var p = this.particles[i];
            p.angle += p.speed;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(p.angle) * p.radiusX, cy + Math.sin(p.angle) * p.radiusY, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(70,140,220,' + p.opacity + ')';
            ctx.fill();
        }
        requestAnimationFrame(function () { self.loop(); });
    };

    /* ── CustomCursor (V6: dot only, hover-grow) ─────────────── */

    function CustomCursor() {
        if (window.matchMedia('(pointer:coarse)').matches) return;
        var dot = document.getElementById('cursor-dot');
        if (!dot) return;
        document.body.classList.add('has-custom-cursor');
        var visible = false;

        document.addEventListener('mousemove', function (e) {
            dot.style.left = e.clientX + 'px';
            dot.style.top = e.clientY + 'px';
            if (!visible) { visible = true; dot.style.opacity = '1'; }
        });

        document.addEventListener('mouseleave', function () {
            visible = false;
            dot.style.opacity = '0';
        });

        document.addEventListener('mouseover', function (e) {
            if (e.target.closest('a, button, [data-magnetic]')) {
                dot.classList.add('cursor-dot--hover');
            }
        });

        document.addEventListener('mouseout', function (e) {
            if (e.target.closest('a, button, [data-magnetic]')) {
                dot.classList.remove('cursor-dot--hover');
            }
        });
    }

    /* ── CardTilt ───────────────────────────────────────────── */

    function CardTilt() {
        if (window.matchMedia('(pointer:coarse)').matches) return;
        document.querySelectorAll('[data-tilt]').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 8) + 'deg) rotateY(' + ((x - 0.5) * 8) + 'deg)';
            });
            card.addEventListener('mouseleave', function () {
                card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
            });
        });
    }

    /* ── CardGlow ──────────────────────────────────────────── */

    function CardGlow() {
        if (window.matchMedia('(pointer:coarse)').matches) return;
        document.querySelectorAll('.glass-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty('--glow-x', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
                card.style.setProperty('--glow-y', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
                card.style.setProperty('--card-glow', 'rgba(70,140,220,0.06)');
            });
            card.addEventListener('mouseleave', function () {
                card.style.setProperty('--card-glow', 'transparent');
            });
        });
    }

    /* ── MagneticElements ──────────────────────────────────── */

    function MagneticElements() {
        if (window.matchMedia('(pointer:coarse)').matches) return;
        document.querySelectorAll('[data-magnetic]').forEach(function (el) {
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2) + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = 'translate(0,0)';
            });
        });
    }

    /* ── TypingEffect (homepage) ────────────────────────────── */

    function TypingEffect(el, text, speed) {
        if (!el) return;
        this.el = el; this.text = text; this.speed = speed || 55; this.index = 0;
        this.cursor = document.createElement('span');
        this.cursor.className = 'typing-cursor';
        this.cursor.textContent = '|';
        el.textContent = '';
        el.appendChild(this.cursor);
        this.type();
    }

    TypingEffect.prototype.type = function () {
        var self = this;
        if (this.index < this.text.length) {
            this.el.insertBefore(document.createTextNode(this.text.charAt(this.index)), this.cursor);
            this.index++;
            setTimeout(function () { self.type(); }, this.speed);
        }
    };

    /* ── NumberReveal ──────────────────────────────────────── */

    function NumberReveal() {
        var els = document.querySelectorAll('.number-reveal');
        if (!els.length) return;
        var revealed = false;

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !revealed) {
                    revealed = true;
                    els.forEach(function (el) { el.classList.add('revealed'); });
                    els.forEach(function (el) {
                        var target = parseInt(el.getAttribute('data-target'), 10);
                        var suffix = el.getAttribute('data-suffix') || '';
                        if (isNaN(target) || target === 0) { el.textContent = '0' + suffix; return; }
                        var start = performance.now(), duration = 1500;
                        function tick(now) {
                            var p = Math.min((now - start) / duration, 1);
                            var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
                            el.textContent = Math.round(eased * target).toLocaleString('en-US');
                            if (p < 1) requestAnimationFrame(tick);
                            else el.textContent = target.toLocaleString('en-US') + suffix;
                        }
                        requestAnimationFrame(tick);
                    });
                    obs.disconnect();
                }
            });
        }, { threshold: 0.3 });

        var card = document.querySelector('.numbers-card');
        if (card) obs.observe(card);
    }

    /* ── HorizontalScroll (principles page) ────────────────── */

    function HorizontalScroll(lenis) {
        if (window.innerWidth < 768) return;
        var section = document.querySelector('.section-principles');
        var track = document.getElementById('horizontal-track');
        if (!section || !track) return;
        this.section = section; this.track = track;
        this.calculate();
        var self = this;
        window.addEventListener('resize', function () {
            if (window.innerWidth < 768) return;
            self.calculate();
        });
    }

    HorizontalScroll.prototype.calculate = function () {
        var scrollDist = this.track.scrollWidth - window.innerWidth + 200;
        this.section.style.height = (window.innerHeight + scrollDist) + 'px';
        this.scrollDistance = scrollDist;
    };

    HorizontalScroll.prototype.update = function (scrollY) {
        if (window.innerWidth < 768 || !this.section) return;
        var top = this.section.offsetTop;
        var progress = Math.max(0, Math.min(1, (scrollY - top) / (this.section.offsetHeight - window.innerHeight)));
        this.track.style.transform = 'translateX(' + (-progress * this.scrollDistance) + 'px)';
    };

    /* ── ScrollAnimations ──────────────────────────────────── */

    function ScrollAnimations() {
        var reveals = document.querySelectorAll('[data-reveal]');
        if (reveals.length) {
            var ro = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { e.target.classList.add('in-view'); ro.unobserve(e.target); }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -30px 0px' });
            reveals.forEach(function (el) { ro.observe(el); });
        }

        var anims = document.querySelectorAll('[data-animate]');
        if (anims.length) {
            var ao = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        var d = e.target.getAttribute('data-delay');
                        if (d) e.target.style.transitionDelay = d;
                        e.target.classList.add('in-view');
                        ao.unobserve(e.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
            anims.forEach(function (el) { ao.observe(el); });
        }

        var dividers = document.querySelectorAll('.section-divider');
        if (dividers.length) {
            var divo = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) { e.target.classList.add('in-view'); divo.unobserve(e.target); }
                });
            }, { threshold: 0.5 });
            dividers.forEach(function (el) { divo.observe(el); });
        }

        var accent = document.querySelector('.thesis-accent');
        if (accent) {
            var to = new IntersectionObserver(function (entries) {
                if (entries[0].isIntersecting) { accent.classList.add('glow-pulse'); to.unobserve(accent); }
            }, { threshold: 0.5 });
            to.observe(accent);
        }
    }

    /* ── SoundDesign ───────────────────────────────────────── */

    function SoundDesign() {
        var audio = null, canPlay = false;
        function unlock() {
            if (audio) return;
            try {
                audio = new Audio('assets/click.mp3');
                audio.volume = 0.3;
                audio.load();
                canPlay = true;
            } catch (e) { /* audio asset not available */ }
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        }
        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);

        document.querySelectorAll('[data-sound-hover]').forEach(function (el) {
            el.addEventListener('mouseenter', function () {
                if (canPlay && audio) { audio.currentTime = 0; audio.play().catch(function () {}); }
            });
        });
    }

    /* ── EasterEgg ─────────────────────────────────────────── */

    function EasterEgg() {
        var code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], idx = 0;
        document.addEventListener('keydown', function (e) {
            if (e.keyCode === code[idx]) { idx++; if (idx === code.length) { idx = 0; show(); } }
            else { idx = 0; }
        });
        function show() {
            var m = document.createElement('div');
            m.textContent = 'Built by a 14-year-old.';
            m.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);z-index:10000;font-family:var(--font-display);font-size:2rem;color:rgba(70,140,220,0.5);pointer-events:none;text-align:center;animation:easterEggFade 3s ease-out forwards;';
            document.body.appendChild(m);
            setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 3200);
        }
    }

    /* ── MonogramGlow (homepage) ────────────────────────────── */

    function MonogramGlow() {
        if (window.matchMedia('(pointer:coarse)').matches) return;
        var mono = document.querySelector('.hero-monogram');
        if (!mono) return;
        var glow = mono.querySelector('.hero-monogram-glow');
        if (!glow) return;
        document.addEventListener('mousemove', function (e) {
            var r = mono.getBoundingClientRect();
            var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            var dist = Math.sqrt(dx * dx + dy * dy);
            var prox = Math.max(0, 1 - dist / 400);
            var blur = 80 + prox * 80, op = 0.1 + prox * 0.15;
            glow.style.filter = 'drop-shadow(0 0 ' + blur + 'px rgba(70,140,220,' + op.toFixed(3) + ')) drop-shadow(0 0 ' + (blur * 2) + 'px rgba(70,140,220,' + (op * 0.4).toFixed(3) + '))';
        });
    }

    /* ── MobileMenu ────────────────────────────────────────── */

    function MobileMenu(lenisRef) {
        var toggle = document.getElementById('menu-toggle');
        var overlay = document.getElementById('mobile-menu');
        if (!toggle || !overlay) return;

        var isOpen = false;

        function open() {
            isOpen = true;
            toggle.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
            if (lenisRef && lenisRef.current) lenisRef.current.stop();
        }

        function close() {
            isOpen = false;
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('menu-open');
            if (lenisRef && lenisRef.current) lenisRef.current.start();
        }

        toggle.addEventListener('click', function () {
            if (isOpen) close(); else open();
        });

        overlay.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { close(); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen) close();
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 768 && isOpen) close();
        });
    }

    /* ── ActiveNav ─────────────────────────────────────────── */

    function ActiveNav() {
        var path = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === path || (path.endsWith(href))) {
                link.classList.add('nav-link--active');
            }
        });
        // Also highlight in mobile menu
        document.querySelectorAll('.mobile-menu-link').forEach(function (link) {
            var href = link.getAttribute('href');
            if (href === path || (path.endsWith(href))) {
                link.style.color = 'var(--accent-gold)';
            }
        });
    }

    /* ── Init ──────────────────────────────────────────────── */

    document.addEventListener('DOMContentLoaded', function () {
        var isHome = document.body.classList.contains('page-home');
        var isContact = document.body.classList.contains('page-contact');
        var lenisRef = { current: null };
        var horizontalScroll = null;

        // 1. Lenis v1.3+
        if (typeof Lenis !== 'undefined') {
            var lenis = new Lenis({
                duration: 1.2,
                easing: function (t) { return 1 - Math.pow(2, -10 * t); },
                autoRaf: true
            });
            lenisRef.current = lenis;

            var nav = document.querySelector('.nav');
            var orbs = document.querySelectorAll('.gradient-orb');
            var gridRef = null;

            lenis.on('scroll', function (e) {
                var scrollY = e.animatedScroll || e.scroll || 0;

                if (gridRef) {
                    gridRef.parallaxOffset = scrollY * 0.3;
                    gridRef.opacity = Math.max(0.15, 1 - scrollY / 2000);
                }

                orbs.forEach(function (orb) {
                    orb.style.setProperty('--parallax-orb', (scrollY * 0.5) + 'px');
                });

                if (nav) nav.classList.toggle('scrolled', scrollY > 50);

                if (horizontalScroll) horizontalScroll.update(scrollY);
            });

            // Anchor links
            document.querySelectorAll('a[href^="#"]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var href = this.getAttribute('href');
                    if (href === '#') return;
                    var target = document.querySelector(href);
                    if (target) { e.preventDefault(); lenis.scrollTo(target); }
                });
            });

            // 2. Canvases
            try {
                var gridCanvas = document.getElementById('network-grid');
                var grid = gridCanvas ? new NetworkGrid(gridCanvas, isContact) : null;
                gridRef = grid;

                if (isHome) {
                    new GradientMesh(document.getElementById('gradient-mesh'));
                    new MonogramParticles(document.getElementById('monogram-particles'));
                }
            } catch (e) { console.warn('Canvas init error:', e); }

            // 3. Cursor + Nav
            new CustomCursor();
            new ActiveNav();
            new MobileMenu(lenisRef);

            // 4. Homepage: preloader chain
            if (isHome) {
                new MonogramGlow();
                var hero = document.querySelector('.hero');
                var tagline = document.getElementById('hero-tagline');

                new Preloader(function () {
                    if (hero) hero.classList.add('hero--animate');
                    setTimeout(function () {
                        new TypingEffect(tagline, 'We make companies unstoppable.', 55);
                    }, 2000);
                    initShared();
                });
            } else {
                initShared();
            }

            function initShared() {
                try {
                    new CardTilt();
                    new CardGlow();
                    new MagneticElements();
                    new ScrollAnimations();
                    new NumberReveal();
                    horizontalScroll = new HorizontalScroll(lenis);
                    new SoundDesign();
                    new EasterEgg();
                } catch (e) { console.warn('Module init error:', e); }
            }

        } else {
            // Fallback: no Lenis
            var nav = document.querySelector('.nav');

            if (!isContact) {
                var gridCanvas = document.getElementById('network-grid');
                var grid = gridCanvas ? new NetworkGrid(gridCanvas) : null;
            }

            if (isHome) {
                new GradientMesh(document.getElementById('gradient-mesh'));
                new MonogramParticles(document.getElementById('monogram-particles'));
            }

            new CustomCursor();
            new ActiveNav();
            new MobileMenu(lenisRef);

            window.addEventListener('scroll', function () {
                var scrollY = window.scrollY;
                if (grid) {
                    grid.parallaxOffset = scrollY * 0.3;
                    grid.opacity = Math.max(0.15, 1 - scrollY / 2000);
                }
                document.querySelectorAll('.gradient-orb').forEach(function (orb) {
                    orb.style.setProperty('--parallax-orb', (scrollY * 0.5) + 'px');
                });
                if (nav) nav.classList.toggle('scrolled', scrollY > 50);
                if (horizontalScroll) horizontalScroll.update(scrollY);
            }, { passive: true });

            document.querySelectorAll('a[href^="#"]').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var href = this.getAttribute('href');
                    if (href === '#') return;
                    var target = document.querySelector(href);
                    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                });
            });

            if (isHome) {
                new MonogramGlow();
                var hero = document.querySelector('.hero');
                var tagline = document.getElementById('hero-tagline');
                new Preloader(function () {
                    if (hero) hero.classList.add('hero--animate');
                    setTimeout(function () { new TypingEffect(tagline, 'We make companies unstoppable.', 55); }, 2000);
                    initFallbackShared();
                });
            } else {
                initFallbackShared();
            }

            function initFallbackShared() {
                new CardTilt();
                new CardGlow();
                new MagneticElements();
                new ScrollAnimations();
                new NumberReveal();
                horizontalScroll = new HorizontalScroll(null);
                new SoundDesign();
                new EasterEgg();
            }
        }
    });
})();
