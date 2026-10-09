const TEMPLATES = {
  1: { name: 'Simple',   desc: 'Clean, single-column and professional. Reads like a polished résumé.' },
  2: { name: 'Modern',   desc: 'Gradient header with cards, skill bars and a timeline.' },
  3: { name: 'Creative', desc: 'Bold, playful blocks with an asymmetric layout.' }
};
const SKILL_LEVELS = { Beginner: 35, Intermediate: 60, Advanced: 80, Expert: 95 };
const qs = new URLSearchParams(location.search);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
function safeUrl(u) {
  u = (u || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch (e) { return ''; }
}
const href = u => safeUrl(u) || '#';
const initials = n => (n || '').trim().split(/\s+/).slice(0, 2).map(w => (w[0] || '').toUpperCase()).join('');
const levelPct = l => SKILL_LEVELS[l] || 60;
function period(s, e) {
  s = (s || '').trim(); e = (e || '').trim();
  if (!s && !e) return '';
  if (!s) return e;
  return s + ' – ' + (e || 'Present');
}
function fmtDate(ts) {
  return ts ? new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';
}
function flash(type, msg) { sessionStorage.setItem('flash', JSON.stringify([type, msg])); }
function takeFlash() {
  const f = sessionStorage.getItem('flash');
  sessionStorage.removeItem('flash');
  return f ? JSON.parse(f) : null;
}

/** Draws the shared top bar + footer and shows any pending message. */
function shell(active, title) {
  document.title = title + ' · FolioForge';
  const nav = [['home', 'index.html', 'Home'], ['create', 'form.html', 'Create'], ['manage', 'manage.html', 'Manage']];
  document.getElementById('top').innerHTML =
    '<header class="topbar"><div class="container topbar-in">' +
    '<a class="brand" href="index.html"><span class="brand-mark">F</span>FolioForge</a>' +
    '<nav class="nav" aria-label="Main">' +
    nav.map(n => `<a href="${n[1]}"${active === n[0] ? ' class="active" aria-current="page"' : ''}>${n[2]}</a>`).join('') +
    '</nav></div></header>';
  document.getElementById('foot').innerHTML =
    '<footer class="footer"><div class="container">FolioForge · Online Portfolio Template Generator</div></footer>';
  const f = takeFlash();
  if (f) {
    const d = document.createElement('div');
    d.className = 'flash flash-' + f[0];
    d.setAttribute('role', 'status');
    d.textContent = f[1];
    document.getElementById('app').prepend(d);
  }
}

function showError(err) {
  console.error(err);
  const app = document.getElementById('app');
  const setup = !configured();
  app.insertAdjacentHTML('afterbegin',
    '<div class="flash flash-error" role="alert">' +
    (setup
      ? 'The database is not connected yet. Open <code>js/config.js</code> and paste your Supabase URL and anon key.'
      : 'Something went wrong: ' + esc(err && err.message ? err.message : err)) +
    '</div>');
}