// The three portfolio templates. Each takes a portfolio object and returns HTML.
const link = (x, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(href(x.url))}" target="_blank" rel="noopener">${esc(x.label)}</a>`;

function renderT1(p) {
  const photo = p.photo_data
    ? `<img class="t1-photo" src="${esc(p.photo_data)}" alt="Photo of ${esc(p.full_name)}">`
    : `<div class="t1-initials" aria-hidden="true">${esc(initials(p.full_name))}</div>`;
  return `<div class="t1"><div class="t1-wrap">
  <header class="t1-header">${photo}<div>
    <h1>${esc(p.full_name)}</h1>
    ${p.headline ? `<p class="t1-headline">${esc(p.headline)}</p>` : ''}
    <ul class="t1-contact">
      <li><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>
      ${p.phone ? `<li>${esc(p.phone)}</li>` : ''}${p.address ? `<li>${esc(p.address)}</li>` : ''}
    </ul></div></header>
  ${p.about ? `<section><h2>About me</h2><p>${nl(p.about)}</p></section>` : ''}
  ${p.experience.length ? `<section><h2>Work experience</h2>${p.experience.map(x => `
    <div class="t1-item"><div class="t1-row"><strong>${esc(x.position || x.company)}</strong><span class="t1-when">${esc(period(x.start_date, x.end_date))}</span></div>
    ${x.position ? `<div class="t1-sub">${esc(x.company)}</div>` : ''}${x.description ? `<p>${nl(x.description)}</p>` : ''}</div>`).join('')}</section>` : ''}
  ${p.education.length ? `<section><h2>Education</h2>${p.education.map(x => `
    <div class="t1-item"><div class="t1-row"><strong>${esc(x.school)}</strong><span class="t1-when">${esc(period(x.start_year, x.end_year))}</span></div>
    ${x.degree ? `<div class="t1-sub">${esc(x.degree)}</div>` : ''}</div>`).join('')}</section>` : ''}
  ${p.projects.length ? `<section><h2>Projects</h2>${p.projects.map(x => `
    <div class="t1-item"><div class="t1-row"><strong>${esc(x.title)}</strong>${x.url ? `<a class="t1-when" href="${esc(href(x.url))}" target="_blank" rel="noopener">View project</a>` : ''}</div>
    ${x.description ? `<p>${nl(x.description)}</p>` : ''}</div>`).join('')}</section>` : ''}
  ${p.skills.length ? `<section><h2>Skills</h2><ul class="t1-skills">${p.skills.map(x => `<li>${esc(x.name)}<span>${esc(x.level)}</span></li>`).join('')}</ul></section>` : ''}
  ${p.social_links.length ? `<section><h2>Links</h2><ul class="t1-links">${p.social_links.map(x => `<li>${link(x)}</li>`).join('')}</ul></section>` : ''}
  </div></div>`;
}

function renderT2(p) {
  const photo = p.photo_data
    ? `<img class="t2-photo" src="${esc(p.photo_data)}" alt="Photo of ${esc(p.full_name)}">`
    : `<div class="t2-initials" aria-hidden="true">${esc(initials(p.full_name))}</div>`;
  const when = s => s ? `<span class="t2-when">${esc(s)}</span>` : '';
  return `<div class="t2">
  <header class="t2-hero"><div class="t2-hero-in">${photo}<div>
    <h1>${esc(p.full_name)}</h1>
    ${p.headline ? `<p class="t2-headline">${esc(p.headline)}</p>` : ''}
    <div class="t2-chips"><a class="t2-chip" href="mailto:${esc(p.email)}">Email me</a>${p.social_links.map(x => link(x, 't2-chip')).join('')}</div>
  </div></div></header>
  <div class="t2-main">
    <aside class="t2-col">
      <section class="t2-card"><h2>Contact</h2><ul class="t2-contact">
        <li><b>Email</b><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></li>
        ${p.phone ? `<li><b>Phone</b>${esc(p.phone)}</li>` : ''}${p.address ? `<li><b>Address</b>${esc(p.address)}</li>` : ''}
      </ul></section>
      ${p.skills.length ? `<section class="t2-card"><h2>Skills</h2>${p.skills.map(x => `
        <div class="t2-skill"><div class="t2-skill-top">${esc(x.name)}<span>${esc(x.level)}</span></div>
        <div class="t2-bar"><i style="width:${levelPct(x.level)}%"></i></div></div>`).join('')}</section>` : ''}
      ${p.social_links.length ? `<section class="t2-card"><h2>Find me online</h2><div class="t2-pills">${p.social_links.map(x => link(x)).join('')}</div></section>` : ''}
    </aside>
    <div class="t2-col">
      ${p.about ? `<section class="t2-card"><h2>About me</h2><p>${nl(p.about)}</p></section>` : ''}
      ${p.experience.length ? `<section class="t2-card"><h2>Experience</h2><ul class="t2-timeline">${p.experience.map(x => `
        <li><div class="t2-tl-head"><strong>${esc(x.position || x.company)}</strong>${when(period(x.start_date, x.end_date))}</div>
        ${x.position ? `<div class="t2-org">${esc(x.company)}</div>` : ''}${x.description ? `<p>${nl(x.description)}</p>` : ''}</li>`).join('')}</ul></section>` : ''}
      ${p.projects.length ? `<section class="t2-card"><h2>Projects</h2><div class="t2-projects">${p.projects.map(x => `
        <article class="t2-proj"><h3>${esc(x.title)}</h3>${x.description ? `<p>${nl(x.description)}</p>` : ''}
        ${x.url ? `<a href="${esc(href(x.url))}" target="_blank" rel="noopener">View project</a>` : ''}</article>`).join('')}</div></section>` : ''}
      ${p.education.length ? `<section class="t2-card"><h2>Education</h2><ul class="t2-timeline">${p.education.map(x => `
        <li><div class="t2-tl-head"><strong>${esc(x.school)}</strong>${when(period(x.start_year, x.end_year))}</div>
        ${x.degree ? `<div class="t2-org">${esc(x.degree)}</div>` : ''}</li>`).join('')}</ul></section>` : ''}
    </div>
  </div></div>`;
}

function renderT3(p) {
  const photo = p.photo_data
    ? `<img class="t3-photo" src="${esc(p.photo_data)}" alt="Photo of ${esc(p.full_name)}">`
    : `<div class="t3-initials" aria-hidden="true">${esc(initials(p.full_name))}</div>`;
  const when = s => s ? `<span class="t3-when">${esc(s)}</span>` : '';
  const blocks = (arr, offset, fn) => arr.map((x, i) => `<article class="t3-block c${((i + offset) % 3) + 1}">${fn(x)}</article>`).join('');
  return `<div class="t3"><div class="t3-wrap">
  <header class="t3-hero"><div>
    <p class="t3-hello">Hi, I'm</p><h1>${esc(p.full_name)}</h1>
    ${p.headline ? `<p class="t3-headline">${esc(p.headline)}</p>` : ''}</div>
    <div class="t3-photo-box">${photo}${p.address ? `<span class="t3-sticker">${esc(p.address)}</span>` : ''}</div>
  </header>
  ${p.skills.length ? `<div class="t3-ribbon" aria-label="Skills">${p.skills.map(x => `<span>${esc(x.name)}</span>`).join('')}</div>` : ''}
  <div class="t3-grid">
    ${p.about ? `<section class="t3-about"><p>${nl(p.about)}</p></section>` : ''}
    <div class="t3-stack">
      ${p.experience.length ? `<section><h2 class="t3-title">Where I've worked</h2><div class="t3-stack">${blocks(p.experience, 0, x => `
        <h3>${esc(x.position || x.company)}</h3>${x.position ? `<div class="t3-sub">${esc(x.company)}</div>` : ''}
        ${when(period(x.start_date, x.end_date))}${x.description ? `<p>${nl(x.description)}</p>` : ''}`)}</div></section>` : ''}
      ${p.education.length ? `<section><h2 class="t3-title">Where I studied</h2><div class="t3-stack">${blocks(p.education, 1, x => `
        <h3>${esc(x.school)}</h3>${x.degree ? `<div class="t3-sub">${esc(x.degree)}</div>` : ''}${when(period(x.start_year, x.end_year))}`)}</div></section>` : ''}
    </div>
    <div class="t3-stack shift">
      ${p.projects.length ? `<section><h2 class="t3-title">Things I've made</h2><div class="t3-stack">${blocks(p.projects, 2, x => `
        <h3>${esc(x.title)}</h3>${x.description ? `<p>${nl(x.description)}</p>` : ''}
        ${x.url ? `<a href="${esc(href(x.url))}" target="_blank" rel="noopener">Take a look</a>` : ''}`)}</div></section>` : ''}
      ${p.skills.length ? `<section><h2 class="t3-title">What I'm good at</h2><div class="t3-tags">${p.skills.map(x => `<span class="t3-tag">${esc(x.name)}<small>${esc(x.level)}</small></span>`).join('')}</div></section>` : ''}
    </div>
  </div>
  <section class="t3-contact"><h2>Let's work together.</h2><p>Say hello. I'd love to hear from you.</p>
    <ul><li>${esc(p.email)}</li>${p.phone ? `<li>${esc(p.phone)}</li>` : ''}</ul>
    <a class="t3-btn" href="mailto:${esc(p.email)}">Send an email</a>${p.social_links.map(x => link(x, 't3-btn')).join('')}
  </section></div></div>`;
}

const RENDERERS = { 1: renderT1, 2: renderT2, 3: renderT3 };
const FONTS = {
  1: 'family=Inter:wght@400;500;600&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400',
  2: 'family=Outfit:wght@300;400;500;600;700',
  3: 'family=Space+Grotesk:wght@400;500;700&family=Caveat:wght@600;700'
};