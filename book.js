// ===== Config =====
const UPI = 'shitalfd1102@okaxis';
const PAYEE = 'HelpDesignerIndia';
const WA = '919537656086'; // WhatsApp destination for bookings

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

// ===== Submit details -> jump to payment =====
$('submitDetails').addEventListener('click', () => {
  if (!validate()) return;
  $('payCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('Details saved — now complete your payment');
});

// ===== Complete registration -> WhatsApp (with screenshot if possible) =====
$('completeReg').addEventListener('click', async () => {
  if (!validate()) return;
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
