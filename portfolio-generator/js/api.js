// Database access (Supabase REST API over HTTPS).
const configured = () => !/YOUR_/.test(CONFIG.SUPABASE_URL + CONFIG.SUPABASE_ANON_KEY);
const sb = configured() ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) : null;

function need() {
  if (!sb) throw new Error('Supabase is not configured');
  return sb;
}
function check({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}
const byOrder = (a, b) => (a.sort_order - b.sort_order) || (a.id - b.id);

async function listPortfolios() {
  return check(await need().from('portfolios')
    .select('id, full_name, headline, email, template, updated_at, photo_data')
    .order('updated_at', { ascending: false }));
}

async function getPortfolio(id) {
  const p = check(await need().from('portfolios')
    .select('*, education(*), skills(*), projects(*), experience(*), social_links(*)')
    .eq('id', id).maybeSingle());
  if (!p) return null;
  ['education', 'skills', 'projects', 'experience', 'social_links'].forEach(k => p[k].sort(byOrder));
  return p;
}

/** Creates (id = null) or updates a portfolio and replaces its child rows. Returns the id. */
async function savePortfolio(id, main, kids) {
  const db = need();
  if (id) {
    check(await db.from('portfolios').update({ ...main, updated_at: new Date().toISOString() }).eq('id', id));
  } else {
    id = check(await db.from('portfolios').insert(main).select('id').single()).id;
  }
  for (const table of ['education', 'skills', 'projects', 'experience', 'social_links']) {
    check(await db.from(table).delete().eq('portfolio_id', id));
    const rows = (kids[table] || []).map((r, i) => ({ ...r, portfolio_id: id, sort_order: i }));
    if (rows.length) check(await db.from(table).insert(rows));
  }
  return id;
}

async function setTemplate(id, t) {
  check(await need().from('portfolios').update({ template: t, updated_at: new Date().toISOString() }).eq('id', id));
}

async function deletePortfolio(id) {
  check(await need().from('portfolios').delete().eq('id', id)); // child rows go with ON DELETE CASCADE
}