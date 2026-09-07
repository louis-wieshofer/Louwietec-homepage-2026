/* hero.js — das Herzstück: scroll-gesteuerte Hero-Sequenz (nur unter html.js-motion).
   Zwei Modi:
   · placeholder (Standard, bis die Higgsfield-Sequenz vorliegt): Canvas — aus Rauschen (Punkte) wird
     beim Scrollen eine Kette aus dreizehn Gliedern; am Ende dockt das Icon am Header-Logo an.
   · frames: Bildsequenz aus /assets/frames/<version>/manifest.json, vorgeladen, Shot 1 läuft beim Laden
     einmal stumm ab, der Rest folgt dem Scroll (Frame-Scrubbing).
   DOM-Vertrag: section[data-hero][data-hero-mode][data-frames-version] · canvas[data-hero-canvas]
   · img[data-hero-poster] · [data-hero-headline] · img[data-hero-dock] · Header: [data-logo-dock-target]
   Umschalten für Tests: ?hero=frames bzw. ?hero=placeholder. Ohne Bewegung/JS bleibt das Poster.
   Manifest: { version, fps, count, width, height, pattern:"frame_{i:04}.webp", intro_end, poster,
               portrait?: { pattern, width, height } } */
import { FRAMES_BASE, FRAMES_VERSION } from './config.js';

const LINKS = 13;

/* ---------- Geometrie der Kette (normierte Koordinaten 0..1) ---------- */
function chainPath(w, h) {
  // dreizehn Glieder, abwechselnd liegend/stehend, auf einer leicht ansteigenden Linie
  const pts = [];
  const margin = Math.min(w, h) * 0.08;
  const usable = w - margin * 2;
  const step = usable / (LINKS + 1);
  for (let i = 0; i < LINKS; i++) {
    const x = margin + step * (i + 1);
    const y = h * 0.6 - (i / (LINKS - 1)) * h * 0.14;
    const horizontal = i % 2 === 0;
    pts.push({ x, y, w: horizontal ? step * 1.05 : step * 0.5, h: horizontal ? step * 0.5 : step * 1.05 });
  }
  return pts;
}

/* ---------- Platzhalter: Punkte → Kette ---------- */
function makeDots(n, w, h, seed = 7) {
  let s = seed;
  const rnd = () => { s = (s * 16807 + 11) % 2147483647; return s / 2147483647; };
  const dots = [];
  for (let i = 0; i < n; i++) dots.push({ x: rnd() * w, y: rnd() * h, vx: (rnd() - .5) * .18, vy: (rnd() - .5) * .18, r: 1 + rnd() * 1.8, t: null });
  return dots;
}
function assignTargets(dots, links) {
  // jeder Punkt bekommt eine Position auf dem Rand eines Glieds
  dots.forEach((d, i) => {
    const l = links[i % links.length];
    const u = ((i * 0.618) % 1) * 4; // Umfangsposition 0..4
    let x, y;
    if (u < 1) { x = l.x - l.w / 2 + u * l.w; y = l.y - l.h / 2; }
    else if (u < 2) { x = l.x + l.w / 2; y = l.y - l.h / 2 + (u - 1) * l.h; }
    else if (u < 3) { x = l.x + l.w / 2 - (u - 2) * l.w; y = l.y + l.h / 2; }
    else { x = l.x - l.w / 2; y = l.y + l.h / 2 - (u - 3) * l.h; }
    d.t = { x, y };
  });
}
const easeInOut = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Gerundetes Rechteck als Pfad (Eckenradius der Website, proportional zur Gliedgröße). */
function roundRect(ctx, x, y, w, h) {
  const r = Math.min(4, w / 4, h / 4);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlaceholder(ctx, w, h, p, dots, links, tick) {
  ctx.clearRect(0, 0, w, h);
  const k = easeInOut(Math.min(1, Math.max(0, p / 0.85)));
  // Punkte: driften, ziehen mit dem Fortschritt an ihre Kettenposition
  ctx.fillStyle = 'rgba(79,141,255,.85)';
  for (const d of dots) {
    d.x += d.vx; d.y += d.vy;
    if (d.x < 0 || d.x > w) d.vx *= -1; if (d.y < 0 || d.y > h) d.vy *= -1;
    const x = d.x + (d.t.x - d.x) * k, y = d.y + (d.t.y - d.y) * k;
    ctx.globalAlpha = 0.35 + 0.5 * (1 - k);
    ctx.beginPath(); ctx.arc(x, y, d.r * (1 - k * .5) + 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Glieder: erscheinen nacheinander mit dem Fortschritt, rasten ein
  const shown = p * (LINKS + 2);
  ctx.lineWidth = Math.max(2, w / 640);
  links.forEach((l, i) => {
    const a = Math.min(1, Math.max(0, shown - i));
    if (a <= 0) return;
    const grow = 0.6 + 0.4 * a;
    ctx.strokeStyle = `rgba(79,141,255,${(0.25 + 0.75 * a).toFixed(3)})`;
    ctx.shadowColor = 'rgba(79,141,255,.55)'; ctx.shadowBlur = a >= 1 && shown - i < 1.6 ? 18 : 0;
    roundRect(ctx, l.x - l.w * grow / 2, l.y - l.h * grow / 2, l.w * grow, l.h * grow);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
  // letztes Glied gefüllt, wenn die Kette steht
  if (p > 0.9) {
    const l = links[LINKS - 1];
    ctx.fillStyle = `rgba(79,141,255,${((p - 0.9) * 2).toFixed(3)})`;
    roundRect(ctx, l.x - l.w / 2, l.y - l.h / 2, l.w, l.h);
    ctx.fill();
  }
  // leise Textur: Zeitstempel-Zeile
  ctx.font = `${Math.max(10, w / 110)}px "Geist Mono", ui-monospace, monospace`;
  ctx.fillStyle = 'rgba(246,245,241,.16)';
  ctx.fillText(`${LINKS} Glieder · Fortschritt ${(p * 100).toFixed(0).padStart(3, ' ')} % · ${tick}`, w * 0.08, h * 0.9);
}

/* ---------- Bildsequenz ---------- */
async function loadManifest(version) {
  const res = await fetch(`${FRAMES_BASE}${version}/manifest.json`, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Manifest ${res.status}`);
  return res.json();
}
function frameUrl(version, pattern, i) {
  return `${FRAMES_BASE}${version}/${pattern.replace(/\{i:0?(\d+)\}/, (_, d) => String(i).padStart(+d, '0'))}`;
}
async function preloadFrames(urls, onEach, pool = 6) {
  const out = new Array(urls.length);
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const i = next++;
      try {
        const blob = await (await fetch(urls[i], { cache: 'force-cache' })).blob();
        out[i] = await createImageBitmap(blob);
      } catch (e) { out[i] = null; }
      onEach(i, out[i]);
    }
  };
  await Promise.all(Array.from({ length: pool }, worker));
  return out;
}
function drawCover(ctx, img, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s, dh = img.height * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/* ---------- Aufbau ---------- */
export async function init() {
  const hero = document.querySelector('[data-hero]');
  const stage = hero?.querySelector('.hero__stage') || hero; // sichtbare Bühne (sticky); der Wrapper trägt die Pin-Strecke
  const canvas = hero?.querySelector('[data-hero-canvas]');
  if (!hero || !canvas || !document.documentElement.classList.contains('js-motion')) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const params = new URLSearchParams(location.search);
  let mode = params.get('hero') || hero.dataset.heroMode || 'placeholder';
  const version = hero.dataset.framesVersion || FRAMES_VERSION;
  const dock = hero.querySelector('[data-hero-dock]');
  const dockTarget = document.querySelector('[data-logo-dock-target]');
  const isMobile = () => window.matchMedia('(max-width: 63.9375rem)').matches;

  let w = 0, h = 0, dpr = 1, progress = 0, tick = 0, docked = false;
  let dots = [], links = [];
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = stage.clientWidth; h = stage.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    links = chainPath(w, h);
    if (!dots.length) dots = makeDots(isMobile() ? 90 : 140, w, h);
    assignTargets(dots, links);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Andocken: das Icon fliegt zum Header-Logo (FLIP), dann glüht das Header-Logo kurz
  const tryDock = () => {
    if (docked || !dock || !dockTarget || progress < 0.92) return;
    docked = true;
    const from = dock.getBoundingClientRect(), to = dockTarget.querySelector('img')?.getBoundingClientRect() || dockTarget.getBoundingClientRect();
    dock.setAttribute('data-docked', '');
    dock.style.transition = 'none';
    dock.style.transform = 'translate(0,0) scale(1)';
    requestAnimationFrame(() => {
      dock.style.transition = 'transform 700ms cubic-bezier(.16,1,.3,1), opacity 300ms 500ms';
      dock.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`;
      dock.style.opacity = '0';
      setTimeout(() => dockTarget.classList.add('is-docked'), 650);
      setTimeout(() => dockTarget.classList.remove('is-docked'), 1900);
    });
  };
  const undock = () => {
    if (!docked || progress > 0.85) return;
    docked = false;
    if (dock) { dock.removeAttribute('data-docked'); dock.style.transition = 'none'; dock.style.transform = ''; dock.style.opacity = ''; }
  };

  // Scroll-Fortschritt: die Bühne klebt per CSS (sticky) im vorab hohen Wrapper; ScrollTrigger liest nur den
  // Fortschritt (Wrapper-Oberkante am Header → Wrapper-Unterkante am Viewport-Ende). Kein Pin, kein Spacer, kein Shift.
  const setProgress = (p) => { progress = Math.min(1, Math.max(0, p)); tryDock(); undock(); };
  const headerH = () => { const v = getComputedStyle(document.documentElement).getPropertyValue('--header-h').trim(); return v.endsWith('rem') ? parseFloat(v) * 16 : parseFloat(v) || 64; };
  const motionReady = () => new Promise((resolve) => {
    if (window.__lwMotionReady) return resolve(true);
    if (window.__lwMotionReady === false) return resolve(false);
    const done = (ok) => { clearTimeout(t); resolve(ok); };
    const t = setTimeout(() => done(false), 4000);
    document.addEventListener('lw:motion-ready', () => done(true), { once: true });
    document.addEventListener('lw:motion-failed', () => done(false), { once: true });
  });
  if (await motionReady() && window.gsap && window.ScrollTrigger) {
    window.ScrollTrigger.create({ trigger: hero, start: () => `top ${headerH()}px`, end: 'bottom bottom', scrub: true, onUpdate: (self) => setProgress(self.progress) });
  } else {
    const onScroll = () => setProgress(window.scrollY / Math.max(1, hero.offsetHeight - stage.offsetHeight || hero.offsetHeight));
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  // Modus Bildsequenz
  let frames = null, manifest = null, introDone = false, introFrame = 0, introTimer = null;
  const startFrames = async () => {
    manifest = await loadManifest(version);
    const portrait = manifest.portrait && window.matchMedia('(orientation: portrait)').matches;
    const set = portrait ? manifest.portrait : manifest;
    const urls = Array.from({ length: manifest.count }, (_, i) => frameUrl(version, set.pattern, i));
    frames = new Array(manifest.count).fill(null);
    let ready = 0;
    await new Promise((resolve) => {
      preloadFrames(urls, (i, img) => {
        frames[i] = img; ready++;
        if (i === 0) resolve();
      }).then(resolve);
    });
    // Shot 1 (0 … intro_end) läuft einmal stumm ab, sobald die Frames da sind
    const introEnd = Math.min(manifest.intro_end ?? 0, manifest.count - 1);
    const fps = manifest.fps || 30;
    await new Promise((resolve) => {
      const go = () => {
        if (introFrame >= introEnd) { introDone = true; return resolve(); }
        if (frames[introFrame + 1]) introFrame++;
        introTimer = setTimeout(go, 1000 / fps);
      };
      go();
    });
  };

  // Zeichenschleife: nur wenn der Hero im Bild ist
  let visible = true, raf = 0;
  const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible && !raf) loop(); }, { threshold: 0 });
  io.observe(hero);
  const loop = () => {
    raf = 0;
    if (!visible) return;
    tick++;
    if (mode === 'frames' && frames) {
      const introEnd = Math.min(manifest.intro_end ?? 0, manifest.count - 1);
      const idx = introDone ? Math.round(introEnd + progress * (manifest.count - 1 - introEnd)) : introFrame;
      let img = frames[idx]; for (let k = idx; k >= 0 && !img; k--) img = frames[k];
      ctx.clearRect(0, 0, w, h);
      if (img) drawCover(ctx, img, w, h);
    } else {
      drawPlaceholder(ctx, w, h, progress, dots, links, String(tick).padStart(5, '0'));
    }
    raf = requestAnimationFrame(loop);
  };
  loop();

  if (mode === 'frames') {
    try { await startFrames(); } catch (e) { console.warn('[LOUWIETEC] Bildsequenz nicht verfügbar, Platzhalter aktiv:', e.message); mode = 'placeholder'; }
  }
  hero.setAttribute('data-hero-active', mode);
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    window.__lwHero = { get mode() { return mode; }, get progress() { return progress; }, get frames() { return frames ? frames.filter(Boolean).length : 0; }, get manifest() { return manifest; }, get introDone() { return introDone; } };
  }
}
