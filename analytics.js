/* ============================================================
   HelpDesignerIndia — website analytics (GA4 + Microsoft Clarity)
   with a lightweight, consent-gated cookie banner.

   >>> TO ACTIVATE: paste your real IDs below and redeploy. <<<
   Until real IDs are set, this file does nothing (no banner,
   no tracking) — safe to ship.
   ============================================================ */
(function () {
  // ===== 1) PASTE YOUR IDS HERE =====
  var GA_ID = 'G-60PR52M7YK';          // Google Analytics 4 Measurement ID (looks like G-ABC123XYZ)
  var CLARITY_ID = 'CLARITY_ID_HERE';  // Microsoft Clarity Project ID (short alphanumeric code)
  // ==================================

  var gaOK = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID.indexOf('XXXX') === -1;
  var clarityOK = /^[a-z0-9]{6,}$/i.test(CLARITY_ID) &&
    CLARITY_ID.indexOf('CLARITY_ID') !== 0 && CLARITY_ID.indexOf('XXXX') === -1;
  if (!gaOK && !clarityOK) return; // nothing configured yet — stay inert

  var KEY = 'hdi_analytics_consent';

  function loadGA() {
    if (!gaOK) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function loadClarity() {
    if (!clarityOK) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function loadAll() { loadGA(); loadClarity(); }

  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var consent = null;
  try { consent = localStorage.getItem(KEY); } catch (e) {}

  if (consent === 'granted') { loadAll(); return; }
  if (consent === 'denied') { return; }

  // ===== Consent banner =====
  function injectStyles() {
    var css =
      '#hdi-cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:720px;margin:0 auto;' +
      'background:var(--card,#1a1413);border:1px solid var(--border-soft,rgba(255,255,255,.1));border-radius:12px;' +
      'padding:16px 18px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;box-shadow:0 14px 44px rgba(0,0,0,.5);' +
      'font-family:var(--sans,system-ui,sans-serif);animation:hdiUp .35s ease}' +
      '@keyframes hdiUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}' +
      '#hdi-cookie p{color:var(--muted,#b8afaa);font-size:.88rem;margin:0;flex:1;min-width:220px;line-height:1.55}' +
      '#hdi-cookie .hdi-btns{display:flex;gap:10px}' +
      '#hdi-cookie button{font-family:inherit;font-size:.8rem;font-weight:600;letter-spacing:.03em;padding:10px 18px;' +
      'border-radius:8px;cursor:pointer;border:1px solid var(--accent,#e07a5f);transition:transform .15s ease}' +
      '#hdi-cookie button:hover{transform:translateY(-1px)}' +
      '#hdi-cookie .hdi-accept{background:var(--accent-strong,#d15a45);color:#fff}' +
      '#hdi-cookie .hdi-decline{background:transparent;color:var(--accent,#e07a5f)}' +
      '@media(max-width:520px){#hdi-cookie{flex-direction:column;align-items:stretch}' +
      '#hdi-cookie .hdi-btns{justify-content:stretch}#hdi-cookie button{flex:1}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function showBanner() {
    injectStyles();
    var bar = document.createElement('div');
    bar.id = 'hdi-cookie';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<p>We use cookies to understand website traffic and improve your experience. Is that okay?</p>' +
      '<div class="hdi-btns">' +
      '<button class="hdi-decline" type="button">Decline</button>' +
      '<button class="hdi-accept" type="button">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('.hdi-accept').addEventListener('click', function () {
      store('granted'); bar.remove(); loadAll();
    });
    bar.querySelector('.hdi-decline').addEventListener('click', function () {
      store('denied'); bar.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
