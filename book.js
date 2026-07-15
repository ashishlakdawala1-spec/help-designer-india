// ===== Config =====
const UPI = 'shitalfd1102@okaxis';
const PAYEE = 'HelpDesignerIndia';
const WA = '919537656086'; // WhatsApp destination for bookings

// Web3Forms access key — get a free one at https://web3forms.com (enter your
// email, copy the key). Paste it below to start receiving bookings by email.
// Until a real key is set, email saving is skipped and only WhatsApp is used.
const ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';

const PLANS = {
  intro: { name: 'Introduction Call', amt: 500, dur: '15 minutes' },
  consultancy: { name: 'Consultancy Call', amt: 2000, dur: '45 minutes' },
};

const params = new URLSearchParams(location.search);
const sel = PLANS[params.get('plan')] || null;

const $ = (id) => document.getElementById(id);
const inr = (n) => '₹' + n.toLocaleString('en-IN');
const upiLink = (amt) =>
  `upi://pay?pa=${UPI}&pn=${encodeURIComponent(PAYEE)}&cu=INR` + (amt ? `&am=${amt}` : '');

// ===== Reflect selected plan =====
if (sel) {
  $('planBadge').innerHTML =
    `You're booking&nbsp; <strong>${sel.name}</strong> &nbsp;·&nbsp; <span class="amt">${inr(sel.amt)}</span> &nbsp;·&nbsp; ${sel.dur}`;
  $('payAmt').textContent = inr(sel.amt);
  $('upiPay').href = upiLink(sel.amt);
} else {
  $('upiPay').href = upiLink();
}

// ===== Toast =====
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== Copy UPI ID =====
$('copyUpi').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(UPI);
    toast('UPI ID copied!');
  } catch {
    toast('Could not copy — please copy it manually');
  }
});

// ===== Screenshot file =====
let file = null;
$('screenshot').addEventListener('change', (e) => {
  file = e.target.files[0] || null;
  if (file) toast('Screenshot attached ✓');
});

// ===== Form helpers =====
const form = $('detailsForm');
const collect = () => Object.fromEntries(new FormData(form).entries());

function validate() {
  const d = collect();
  if (!d.name || !d.name.trim()) { toast('Please enter your name'); return false; }
  if (!(d.email && d.email.trim()) && !(d.phone && d.phone.trim())) {
    toast('Please add your email or phone number'); return false;
  }
  return true;
}

// Save the submission to email + Web3Forms dashboard. Returns true on success,
// false if no key is configured or the request fails. Never throws.
async function saveByEmail(stage) {
  if (!ACCESS_KEY || ACCESS_KEY.startsWith('REPLACE_WITH')) return false;
  const d = collect();
  const fd = new FormData();
  fd.append('access_key', ACCESS_KEY);
  fd.append('subject', `New booking${sel ? ` — ${sel.name}` : ''} (${stage})`);
  fd.append('from_name', d.name || 'Website booking');
  fd.append('Plan', sel ? `${sel.name} — ${inr(sel.amt)}` : 'Not specified');
  fd.append('Stage', stage);
  ['name', 'email', 'phone', 'country', 'city', 'brand', 'requirement'].forEach((k) =>
    fd.append(k, d[k] || '')
  );
  fd.append('botcheck', '');
  if (file) fd.append('Payment screenshot', file);
  try {
    const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
    return r.ok;
  } catch {
    return false;
  }
}

function buildMessage() {
  const d = collect();
  const L = [];
  L.push(`*New booking${sel ? ` — ${sel.name} (${inr(sel.amt)})` : ''}*`);
  if (d.name) L.push(`Name: ${d.name}`);
  if (d.email) L.push(`Email: ${d.email}`);
  if (d.phone) L.push(`Phone: ${d.phone}`);
  if (d.country) L.push(`Country: ${d.country}`);
  if (d.city) L.push(`City: ${d.city}`);
  if (d.brand) L.push(`Brand: ${d.brand}`);
  if (d.requirement) L.push(`Requirement: ${d.requirement}`);
  L.push(`\nI've made the UPI payment.${file ? ' Payment screenshot attached.' : ' (Screenshot to follow.)'}`);
  return L.join('\n');
}

// ===== Submit details -> capture lead, jump to payment =====
$('submitDetails').addEventListener('click', () => {
  if (!validate()) return;
  saveByEmail('details submitted'); // capture early so the lead is never lost
  $('payCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('Details saved — now complete your payment');
});

// ===== Complete registration -> WhatsApp (with screenshot if possible) =====
$('completeReg').addEventListener('click', async () => {
  if (!validate()) return;

  // Save to email/dashboard first — this happens regardless of whether the
  // person goes on to finish the WhatsApp step, so the booking is never lost.
  await saveByEmail('payment made');

  const text = buildMessage();

  // If a screenshot is attached and the device can share files, use the native
  // share sheet so the image + details go to WhatsApp together.
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, title: 'HelpDesignerIndia booking' });
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // user cancelled
      // otherwise fall through to WhatsApp link
    }
  }

  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
  if (file) toast('Opening WhatsApp — please attach your screenshot there');
});
