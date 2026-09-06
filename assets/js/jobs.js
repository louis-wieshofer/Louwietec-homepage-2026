/* jobs.js — offene Rollen aus /jobs.json (Repo-Datei). Die statische Liste im Markup ist die stille Version
   und bleibt wortgleich zum Texte-Dokument; hier werden aktive Rollen samt Metadaten gerendert und das
   Rollen-Feld des Bewerbungsformulars gefüllt.
   DOM-Vertrag: ul[data-jobs][data-jobs-src] · template[data-jobs-item] mit [data-j=titel|meta|beschreibung] · select[data-jobs-select] */

export async function init() {
  const list = document.querySelector('[data-jobs]');
  if (!list) return;
  const src = list.dataset.jobsSrc || '/jobs.json';
  let data = null;
  try {
    const res = await fetch(src, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (e) { return; } // statische Liste bleibt
  const roles = (data.roles || []).filter((r) => r && r.aktiv !== false && r.titel);
  if (!roles.length) return;
  const tpl = document.querySelector('template[data-jobs-item]');
  if (tpl) {
    const frag = document.createDocumentFragment();
    for (const r of roles) {
      const node = tpl.content.firstElementChild.cloneNode(true);
      const set = (key, val) => { const el = node.querySelector(`[data-j="${key}"]`); if (el) { if (val) el.textContent = val; else el.remove(); } };
      set('titel', r.titel);
      set('meta', [r.art, r.ort].filter(Boolean).join(' · '));
      set('beschreibung', r.beschreibung);
      frag.appendChild(node);
    }
    list.replaceChildren(frag);
  }
  const select = document.querySelector('select[data-jobs-select]');
  if (select) {
    const first = select.querySelector('option[value=""]');
    select.replaceChildren();
    if (first) select.appendChild(first);
    for (const r of roles) { const o = document.createElement('option'); o.value = r.titel; o.textContent = r.titel; select.appendChild(o); }
  }
}
