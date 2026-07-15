// ===== Service enquiry -> WhatsApp =====
const WA = '919537656086'; // WhatsApp destination for service enquiries
const $ = (id) => document.getElementById(id);

// Optional: pre-select a service via ?service=Fabric%20Sourcing
const preset = new URLSearchParams(location.search).get('service');
if (preset) {
  const sel = $('service');
  [...sel.options].forEach((o) => {
    if (o.value && o.value.toLowerCase() === preset.toLowerCase()) sel.value = o.value;
  });
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

const form = $('enqForm');
const collect = () => Object.fromEntries(new FormData(form).entries());

function validate() {
  const d = collect();
  if (!d.name || !d.name.trim()) { toast('Please enter your name'); return false; }
  if (!(d.phone && d.phone.trim()) && !(d.email && d.email.trim())) {
    toast('Please add your phone or email'); return false;
  }
  if (!d.service) { toast('Please choose the service you need'); return false; }
  return true;
}

function buildMessage() {
  const d = collect();
  const L = ['*Service enquiry*'];
  if (d.name) L.push(`Name: ${d.name}`);
  if (d.phone) L.push(`Phone: ${d.phone}`);
  if (d.email) L.push(`Email: ${d.email}`);
  if (d.brand) L.push(`Brand: ${d.brand}`);
  if (d.service) L.push(`Service needed: ${d.service}`);
  if (d.requirement) L.push(`Details: ${d.requirement}`);
  return L.join('\n');
}

$('sendEnq').addEventListener('click', () => {
  if (!validate()) return;
  // Same-tab navigation is the most reliable way to open the WhatsApp app on mobile.
  window.location.href = `https://wa.me/${WA}?text=${encodeURIComponent(buildMessage())}`;
});
