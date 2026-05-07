/* ================================================================
   LOUWIETEC — i18n Loader
   Client-side EN ↔ DE switcher.
   - URL ?lang= > localStorage > default 'en'
   - data-i18n="key.path" → textContent
   - data-i18n-html="key.path" → innerHTML (for embedded markup)
   - data-i18n-attr="attr1:key1;attr2:key2" → attribute values
   - Sets <html lang> and <meta og:locale> dynamically
   - Exposes window.setLang(lang) and window.getLang()
   ================================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'louwietec_lang';
    var DEFAULT_LANG = 'en';
    var SUPPORTED = ['en', 'de'];
    var LOCALE_MAP = { en: 'en_US', de: 'de_AT' };
    var translations = {};
    var currentLang = DEFAULT_LANG;

    function detectLang() {
        try {
            var url = new URL(window.location.href);
            var fromUrl = url.searchParams.get('lang');
            if (fromUrl && SUPPORTED.indexOf(fromUrl) !== -1) return fromUrl;
        } catch (e) { /* URL ctor not available; fall through */ }
        try {
            var fromStorage = localStorage.getItem(STORAGE_KEY);
            if (fromStorage && SUPPORTED.indexOf(fromStorage) !== -1) return fromStorage;
        } catch (e) { /* localStorage blocked; fall through */ }
        return DEFAULT_LANG;
    }

    function lookup(path) {
        return path.split('.').reduce(function (acc, k) {
            return (acc && acc[k] !== undefined) ? acc[k] : null;
        }, translations);
    }

    function applyTranslations() {
        // textContent translations
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = lookup(key);
            if (typeof val === 'string') el.textContent = val;
        });

        // innerHTML translations (for content with embedded markup like <br>, <span>)
        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-html');
            var val = lookup(key);
            if (typeof val === 'string') el.innerHTML = val;
        });

        // attribute translations: format "attr1:key1;attr2:key2"
        document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
            var spec = el.getAttribute('data-i18n-attr');
            spec.split(';').forEach(function (pair) {
                var idx = pair.indexOf(':');
                if (idx === -1) return;
                var attr = pair.substring(0, idx).trim();
                var key = pair.substring(idx + 1).trim();
                if (!attr || !key) return;
                var val = lookup(key);
                if (typeof val === 'string') el.setAttribute(attr, val);
            });
        });

        // <html lang>
        document.documentElement.setAttribute('lang', currentLang);

        // <meta property="og:locale">
        var ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) ogLocale.setAttribute('content', LOCALE_MAP[currentLang] || LOCALE_MAP[DEFAULT_LANG]);

        // Switcher visual + ARIA state
        document.querySelectorAll('.lang-toggle__btn').forEach(function (btn) {
            var isActive = btn.getAttribute('data-lang') === currentLang;
            btn.classList.toggle('lang-toggle__btn--active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Notify other modules (e.g., main.js) of language change
        try {
            document.dispatchEvent(new CustomEvent('louwietec:langchange', { detail: { lang: currentLang } }));
        } catch (e) { /* CustomEvent not available — skip */ }
    }

    function loadLang(lang) {
        return fetch('i18n/' + lang + '.json', { cache: 'default' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                translations = data;
                currentLang = lang;
                try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
                applyTranslations();
            })
            .catch(function (err) {
                console.warn('[i18n] failed to load ' + lang + ':', err);
            });
    }

    function setLang(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return;
        try {
            var url = new URL(window.location.href);
            if (lang === DEFAULT_LANG) url.searchParams.delete('lang');
            else url.searchParams.set('lang', lang);
            window.history.replaceState({}, '', url.toString());
        } catch (e) { /* history API not available — language still applies */ }
        loadLang(lang);
    }

    function bindSwitcher() {
        document.querySelectorAll('.lang-toggle__btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setLang(btn.getAttribute('data-lang'));
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var lang = detectLang();
        bindSwitcher();
        loadLang(lang);
    });

    // Public API
    window.setLang = setLang;
    window.getLang = function () { return currentLang; };
})();
