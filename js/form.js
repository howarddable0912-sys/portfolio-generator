const editId = +qs.get('id') || 0;
let existingPhoto = null;   // data URL already saved in the database
let newPhoto = null;        // data URL of a freshly chosen picture
shell('create', editId ? 'Edit portfolio' : 'Create portfolio');

const val = r => esc(r || '');
const ROWS = {
  edu: (r = {}) => `<div class="rep-row"><div class="grid g4">
    <label>School / university<input data-k="school" maxlength="160" value="${val(r.school)}"></label>
    <label>Degree / course<input data-k="degree" maxlength="160" value="${val(r.degree)}"></label>
    <label>Start year<input data-k="start_year" maxlength="10" placeholder="2021" value="${val(r.start_year)}"></label>
    <label>End year<input data-k="end_year" maxlength="10" placeholder="2025 or blank" value="${val(r.end_year)}"></label></div>
    <button type="button" class="rm" aria-label="Remove this education entry">&times;</button></div>`,
  skill: (r = {}) => `<div class="rep-row"><div class="grid g2">
    <label>Skill<input data-k="name" maxlength="80" placeholder="JavaScript" value="${val(r.name)}"></label>
    <label>Level<select data-k="level">${Object.keys(SKILL_LEVELS).map(l => `<option${(r.level || 'Intermediate') === l ? ' selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <button type="button" class="rm" aria-label="Remove this skill">&times;</button></div>`,
  proj: (r = {}) => `<div class="rep-row"><div class="grid g2">
    <label>Project title<input data-k="title" maxlength="160" value="${val(r.title)}"></label>
    <label>Link (optional)<input data-k="url" maxlength="255" placeholder="https://github.com/you/project" value="${val(r.url)}"></label></div>
    <label>Description<textarea data-k="description" rows="3" maxlength="2000">${val(r.description)}</textarea></label>
    <button type="button" class="rm" aria-label="Remove this project">&times;</button></div>`,
  exp: (r = {}) => `<div class="rep-row"><div class="grid g4">
    <label>Company / organization<input data-k="company" maxlength="160" value="${val(r.company)}"></label>
    <label>Position<input data-k="position" maxlength="160" value="${val(r.position)}"></label>
    <label>Start<input data-k="start_date" maxlength="20" placeholder="Jun 2023" value="${val(r.start_date)}"></label>
    <label>End<input data-k="end_date" maxlength="20" placeholder="Present or blank" value="${val(r.end_date)}"></label></div>
    <label>What you did<textarea data-k="description" rows="3" maxlength="2000">${val(r.description)}</textarea></label>
    <button type="button" class="rm" aria-label="Remove this experience entry">&times;</button></div>`,
  link: (r = {}) => `<div class="rep-row"><div class="grid g2">
    <label>Label<input data-k="label" maxlength="60" placeholder="LinkedIn" value="${val(r.label)}"></label>
    <label>URL<input data-k="url" maxlength="255" placeholder="https://linkedin.com/in/you" value="${val(r.url)}"></label></div>
    <button type="button" class="rm" aria-label="Remove this link">&times;</button></div>`
};
// form section -> [database table, field that must be filled for the row to be saved]
const SECTIONS = { edu: ['education', 'school'], skill: ['skills', 'name'], proj: ['projects', 'title'], exp: ['experience', 'company'], link: ['social_links', 'url'] };

function addRow(key, data) {
  document.getElementById('list-' + key).insertAdjacentHTML('beforeend', ROWS[key](data));
}
function fillList(key, rows) {
  const box = document.getElementById('list-' + key);
  box.innerHTML = '';
  (rows && rows.length ? rows : [{}]).forEach(r => addRow(key, r));
}
function collect(key) {
  const [, required] = SECTIONS[key];
  return [...document.querySelectorAll('#list-' + key + ' .rep-row')].map(row => {
    const o = {};
    row.querySelectorAll('[data-k]').forEach(el => { o[el.dataset.k] = el.value.trim(); });
    return o;
  }).filter(o => o[required]);
}

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) {
    addRow(add.dataset.add);
    const rows = document.querySelectorAll('#list-' + add.dataset.add + ' .rep-row');
    const first = rows[rows.length - 1].querySelector('input, textarea');
    if (first) first.focus();
    return;
  }
  const rm = e.target.closest('.rm');
  if (rm) {
    const list = rm.closest('[id^="list-"]');
    rm.closest('.rep-row').remove();
    if (!list.children.length) addRow(list.id.replace('list-', ''));
  }
});

function setPreview(src) {
  const box = document.getElementById('photo-preview');
  box.innerHTML = src ? `<img src="${esc(src)}" alt="Profile picture preview">` : '<span>Photo</span>';
}

/** Shrinks a picture to max 480px and returns a small JPEG data URL. */
function resizeImage(file, max = 480) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('That file is not a valid image.'));
    img.src = url;
  });
}

document.getElementById('photo').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('Choose a picture smaller than 10 MB.');
    newPhoto = await resizeImage(file);
    setPreview(newPhoto);
  } catch (err) { e.target.value = ''; newPhoto = null; alert(err.message); }
});

document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = document.getElementById('form');
  if (!f.reportValidity()) return;

  const g = id => document.getElementById(id).value.trim();
  let photo = existingPhoto;
  if (document.getElementById('remove-photo').checked) photo = null;
  if (newPhoto) photo = newPhoto;

  const main = {
    full_name: g('full_name'), headline: g('headline') || null, email: g('email'),
    phone: g('phone') || null, address: g('address') || null, about: g('about') || null, photo_data: photo
  };
  const kids = {};
  for (const key in SECTIONS) kids[SECTIONS[key][0]] = collect(key);
  kids.skills = kids.skills.map(s => ({ name: s.name, level: SKILL_LEVELS[s.level] ? s.level : 'Intermediate' }));
  kids.projects = kids.projects.map(r => ({ title: r.title, description: r.description || null, url: safeUrl(r.url) || null }));
  kids.social_links = kids.social_links
    .map(r => ({ label: r.label || 'Website', url: safeUrl(r.url) }))
    .filter(r => r.url);
  kids.education = kids.education.map(r => ({ school: r.school, degree: r.degree || null, start_year: r.start_year || null, end_year: r.end_year || null }));
  kids.experience = kids.experience.map(r => ({ company: r.company, position: r.position || null, start_date: r.start_date || null, end_date: r.end_date || null, description: r.description || null }));

  const btn = document.getElementById('save');
  btn.disabled = true;
  btn.textContent = 'Saving…';
  try {
    const id = await savePortfolio(editId || null, main, kids);
    if (editId) { flash('success', 'Changes saved to the database.'); location.href = 'preview.html?id=' + id; }
    else { flash('success', 'Saved to the online database. Now pick a template.'); location.href = 'templates.html?id=' + id; }
  } catch (err) {
    btn.disabled = false;
    btn.textContent = editId ? 'Save changes' : 'Save and choose a template';
    showError(err);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

(async () => {
  if (!editId) { Object.keys(SECTIONS).forEach(k => fillList(k, [])); return; }
  document.getElementById('heading').textContent = 'Edit portfolio';
  document.getElementById('save').textContent = 'Save changes';
  document.getElementById('cancel').href = 'manage.html';
  try {
    const p = await getPortfolio(editId);
    if (!p) { flash('error', 'That portfolio does not exist.'); location.replace('manage.html'); return; }
    ['full_name', 'headline', 'email', 'phone', 'address', 'about'].forEach(k => { document.getElementById(k).value = p[k] || ''; });
    existingPhoto = p.photo_data || null;
    if (existingPhoto) { setPreview(existingPhoto); document.getElementById('remove-wrap').hidden = false; }
    fillList('edu', p.education); fillList('skill', p.skills); fillList('proj', p.projects);
    fillList('exp', p.experience); fillList('link', p.social_links);
  } catch (err) { Object.keys(SECTIONS).forEach(k => fillList(k, [])); showError(err); }
})();