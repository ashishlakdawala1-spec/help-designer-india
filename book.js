// ===== Config =====
const UPI = 'shitalfd1102@okaxis';
const PAYEE = 'HelpDesignerIndia';

const PLANS = {
  intro: { name: 'Introduction Call', amt: 500, dur: '15 minutes' },
  consultancy: { name: 'Consultancy Call', amt: 2000, dur: '45 minutes' },
};

const sel = PLANS[new URLSearchParams(location.search).get('plan')] || null;
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
  $('planField').value = `${sel.name} — ${inr(sel.amt)} (${sel.dur})`;
} else {
  $('upiPay').href = upiLink();
  $('planField').value = 'Not specified';
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

// ===== Screenshot feedback =====
$('screenshot').addEventListener('change', (e) => {
  if (e.target.files[0]) toast('Screenshot attached ✓');
});

// ===== Validation =====
const form = $('bookingForm');
const val = (name) => (form.elements[name] ? form.elements[name].value : '').trim();

function validate() {
  if (!val('name')) { toast('Please enter your name'); return false; }
  if (!val('email') && !val('phone')) {
    toast('Please add your email or phone number');
    return false;
  }
  return true;
}

// ===== Submit Details -> jump to payment (does not submit the form) =====
$('submitDetails').addEventListener('click', () => {
  if (!validate()) return;
  $('payCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('Details saved — now complete your payment');
});

// ===== Complete Registration -> native submit to FormSubmit =====
// This uploads all the details + the screenshot straight to the business inbox,
// automatically, with no WhatsApp / contact-picking needed.
form.addEventListener('submit', (e) => {
  if (!validate()) {
    e.preventDefault();
    return;
  }
  const btn = $('completeReg');
  btn.textContent = 'Sending…';
  btn.style.opacity = '0.85';
  // let the native form submission proceed to FormSubmit
});
