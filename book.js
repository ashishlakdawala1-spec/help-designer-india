// ===== Config =====
const UPI = 'shitalfd1102@okaxis';
const PAYEE = 'HelpDesignerIndia';
const WA = '919537656086'; // WhatsApp number bookings are sent to

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
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
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

// WhatsApp message with the booking details
function waMessage() {
  const L = [`*New booking${sel ? ` — ${sel.name} (${inr(sel.amt)})` : ''}*`];
  const add = (label, name) => { const v = val(name); if (v) L.push(`${label}: ${v}`); };
  add('Name', 'name'); add('Email', 'email'); add('Phone', 'phone');
  add('Country', 'country'); add('City', 'city'); add('Brand', 'brand');
  add('Requirement', 'requirement');
  L.push(`\nI've made the UPI payment. Attaching my payment screenshot here. 📎`);
  return L.join('\n');
}

// ===== Submit Details -> jump to payment (does not submit) =====
$('submitDetails').addEventListener('click', () => {
  if (!validate()) return;
  $('payCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  toast('Details saved — now complete your payment');
});

// ===== Complete Registration =====
// 1) The form POSTs details + screenshot to FormSubmit INTO a hidden iframe, so
//    the page doesn't navigate away and the upload can finish.
// 2) When the upload completes (iframe load), open WhatsApp with the details so
//    the customer can also attach the screenshot in chat.
let submitting = false;
let waOpened = false;

function goWhatsApp() {
  if (waOpened) return;
  waOpened = true;
  window.location.href = `https://wa.me/${WA}?text=${encodeURIComponent(waMessage())}`;
}

form.addEventListener('submit', (e) => {
  if (!validate()) { e.preventDefault(); return; }
  submitting = true;
  const btn = $('completeReg');
  btn.textContent = 'Sending…';
  btn.style.opacity = '0.85';
  // Fallback: if the upload is slow to respond, still open WhatsApp after 9s.
  setTimeout(() => { if (submitting) goWhatsApp(); }, 9000);
  // native submit proceeds into the hidden iframe (fs_frame)
});

$('fsFrame').addEventListener('load', () => {
  if (!submitting) return; // ignore the initial about:blank load
  submitting = false;
  goWhatsApp();
});
