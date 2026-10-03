/**
 * CHMSU HireMe — Company Job Postings Page (Pro Redesign v2)
 */
import { icon } from '../components/icons.js';
import { apiGet, apiDelete } from '../api/client.js';
import { navigate } from '../router.js';
import { getState } from '../store.js';
import { showPostingRestrictedModal, openMoaRequestModal } from '../components/moa-modal.js';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote'];
const PH_CITIES = [
  'Bacolod City','Cebu City','Davao City','Manila','Quezon City',
  'Makati City','Taguig City','Pasig City','Iloilo City','Cagayan de Oro',
  'Zamboanga City','General Santos City','Remote / Work from Home',
];
const DEPARTMENTS = [
  'Engineering','Software Development','DevOps','QA / Testing','Data Science',
  'AI / Machine Learning','Cybersecurity','IT Support','Cloud Infrastructure',
  'UI / UX Design','Graphic Design','Product Management','Brand Design','Motion Design',
  'Sales','Business Development','Account Management','Partnerships','Customer Success',
  'Digital Marketing','Content Marketing','SEO / SEM','Social Media','Email Marketing',
  'Operations','Supply Chain','Logistics','Project Management','Process Improvement',
  'Finance','Accounting','Audit','Legal / Compliance','Risk Management',
  'Human Resources','Talent Acquisition','Learning & Development','Payroll',
  'Customer Support','Technical Support','Community Management','Client Relations',
];

let filters = { types:new Set(), locations:new Set(), departments:new Set(), datePosted:'any', minApplicants:0 };

export async function renderJobs(container) {
  const company = getState('company') || {};
  const isCompleted = !!company.profileCompleted;
  const moaStatus = company.moaStatus || 'Pending';
  const isMoaValid = ['active', 'expiring soon'].includes(moaStatus.toLowerCase());
  const canPost = company.canPostOpportunities !== undefined
    ? Boolean(company.canPostOpportunities)
    : (isCompleted && isMoaValid);

  container.innerHTML = `
    <div class="jp-page-header fade-in">
      <div>
        <h1 class="jp-page-title">${icon('briefcase', 20)} Job Postings</h1>
        <p class="jp-page-subtitle">Manage your open positions and attract the right talent</p>
      </div>
      <button class="btn btn--primary" id="btn-post-job">${icon('plus', 16)} Post New Job</button>
    </div>

    <!-- ── MOA Restriction Banner ── -->
    ${!canPost ? `
      <div class="anim-fade-in-up" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="color:#d97706;">${icon('alertCircle', 20)}</span>
          <div>
            <strong style="color:#92400e;font-size:0.88rem;display:block;">MOA Partnership Required to Post Job Vacancies</strong>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#b45309;">
              ${!isCompleted ? 'Please complete your company profile before requesting an MOA and posting job vacancies.' : (moaStatus === 'Requested' ? 'Your MOA request has been submitted to CHMSU CIER and is under review.' : 'An active Memorandum of Agreement (MOA) with CHMSU CIER is required before posting job vacancies.')}
            </p>
          </div>
        </div>
        ${!isCompleted ? `
          <a href="#/profile" class="btn btn--sm btn--primary" style="background:#005930;border-color:#005930;gap:4px;">Complete Profile</a>
        ` : (moaStatus === 'Requested' ? `
          <span style="background:#fef3c7;color:#b45309;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:6px;border:1px solid #fde68a;">Under CIER Review</span>
        ` : `
          <button type="button" class="btn btn--sm btn--primary" id="btn-job-req-moa" style="background:#005930;border-color:#005930;gap:6px;font-weight:600;">${icon('send', 13)} Request MOA with CIER</button>
        `)}
      </div>
    ` : ''}

    <div class="jp-stats-row fade-in">
      <div class="jp-stat-card jp-stat-card--primary">
        <div class="jp-stat-card__top">
          <div class="jp-stat-card__icon">${icon('briefcase', 18)}</div>
        </div>
        <div class="jp-stat-card__value" id="stat-total">—</div>
        <div class="jp-stat-card__label">Total Postings</div>
      </div>
      <div class="jp-stat-card jp-stat-card--success">
        <div class="jp-stat-card__top">
          <div class="jp-stat-card__icon">${icon('checkCircle', 18)}</div>
        </div>
        <div class="jp-stat-card__value" id="stat-open">—</div>
        <div class="jp-stat-card__label">Open</div>
      </div>
      <div class="jp-stat-card jp-stat-card--warning">
        <div class="jp-stat-card__top">
          <div class="jp-stat-card__icon">${icon('clock', 18)}</div>
        </div>
        <div class="jp-stat-card__value" id="stat-draft">—</div>
        <div class="jp-stat-card__label">Drafts</div>
      </div>
      <div class="jp-stat-card jp-stat-card--neutral">
        <div class="jp-stat-card__top">
          <div class="jp-stat-card__icon">${icon('users', 18)}</div>
        </div>
        <div class="jp-stat-card__value" id="stat-applicants">—</div>
        <div class="jp-stat-card__label">Total Applicants</div>
      </div>
    </div>

    <div class="jp-toolbar fade-in">
      <div class="jp-toolbar__left">
        <div class="search-box" style="flex:1;max-width:340px;">
          ${icon('search', 15)}
          <input type="text" class="search-box__input" placeholder="Search title, department, location…" id="job-search-input" />
        </div>
        <select class="form-select" style="width:auto;min-width:136px;" id="job-status-filter">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
        <button class="jf-toggle" id="jf-toggle">
          ${icon('sliders', 14)} Filters <span class="jf-toggle__badge" id="jf-badge">0</span>
        </button>
      </div>
    </div>

    <div class="jf-panel" id="jf-panel">
      <div class="jf-panel__inner">
        <div class="jf-panel__header">
          <span class="jf-panel__title">${icon('filter', 14)} Advanced Filters</span>
          <button class="jf-panel__clear" id="jf-clear">Clear All</button>
        </div>
        <div class="jf-panel__grid">
          <div class="jf-group">
            <span class="jf-group__label">${icon('briefcase', 11)} Employment Type</span>
            <div class="jf-checks" id="jf-type-checks">
              ${EMPLOYMENT_TYPES.map(t => '<label class="jf-check"><input type="checkbox" value="' + t + '"/>' + t + '</label>').join('')}
            </div>
          </div>
          <div class="jf-group">
            <span class="jf-group__label">${icon('mapPin', 11)} Location</span>
            <div class="jf-multiselect" id="jf-loc-ms">
              <div class="jf-multiselect__trigger" id="jf-loc-trigger">
                <span class="jf-multiselect__placeholder">All Locations</span>
                <span class="jf-multiselect__arrow">${icon('chevronDown', 12)}</span>
              </div>
              <div class="jf-multiselect__dropdown" id="jf-loc-dropdown">
                <input type="text" class="jf-multiselect__search" placeholder="Search locations..." />
                ${PH_CITIES.map(c => '<div class="jf-multiselect__option" data-value="' + c + '"><span class="jf-multiselect__check">' + icon('check', 9) + '</span>' + c + '</div>').join('')}
              </div>
            </div>
          </div>
          <div class="jf-group">
            <span class="jf-group__label">${icon('layers', 11)} Department</span>
            <div class="jf-multiselect" id="jf-dept-ms">
              <div class="jf-multiselect__trigger" id="jf-dept-trigger">
                <span class="jf-multiselect__placeholder">All Departments</span>
                <span class="jf-multiselect__arrow">${icon('chevronDown', 12)}</span>
              </div>
              <div class="jf-multiselect__dropdown" id="jf-dept-dropdown">
                <input type="text" class="jf-multiselect__search" placeholder="Search departments..." />
                ${DEPARTMENTS.map(d => '<div class="jf-multiselect__option" data-value="' + d + '"><span class="jf-multiselect__check">' + icon('check', 9) + '</span>' + d + '</div>').join('')}
              </div>
            </div>
          </div>
          <div class="jf-group">
            <span class="jf-group__label">${icon('calendar', 11)} Date Posted</span>
            <div class="jf-btn-group" id="jf-date-group">
              <button class="jf-btn-group__btn jf-btn-group__btn--active" data-value="any">Any Time</button>
              <button class="jf-btn-group__btn" data-value="today">Today</button>
              <button class="jf-btn-group__btn" data-value="week">This Week</button>
              <button class="jf-btn-group__btn" data-value="month">This Month</button>
            </div>
          </div>
          <div class="jf-group">
            <span class="jf-group__label">${icon('users', 11)} Min. Applicants</span>
            <div class="jf-range-wrap">
              <input type="range" class="jf-range" id="jf-applicants" min="0" max="50" value="0" />
              <div class="jf-range-values"><span id="jf-applicants-val">0+</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="jp-results-header fade-in" id="jp-results-header" style="display:none;">
      <p class="jp-results-count" id="jp-results-count"></p>
    </div>

    <div class="jp-grid fade-in" id="jobs-grid">
      ${skeletonCards(4)}
    </div>
  `;

  container.querySelector('#btn-post-job').addEventListener('click', () => {
    const curCo = getState('company') || {};
    const curMoa = (curCo.moaStatus || '').toLowerCase();
    const curCanPost = curCo.canPostOpportunities !== undefined
      ? Boolean(curCo.canPostOpportunities)
      : (Boolean(curCo.profileCompleted) && ['active', 'expiring soon'].includes(curMoa));
    if (!curCanPost) {
      showPostingRestrictedModal('post job vacancies');
      return;
    }
    navigate('/post-job');
  });

  container.querySelector('#btn-job-req-moa')?.addEventListener('click', () => {
    openMoaRequestModal({
      onSuccess: () => {
        renderJobs(container);
      }
    });
  });

  let allJobs = [];
  filters = { types:new Set(), locations:new Set(), departments:new Set(), datePosted:'any', minApplicants:0 };

  const res = await apiGet('/company/jobs');
  if (res && res.success) allJobs = res.data || [];

  updateStats(container, allJobs);
  renderJobCards(container, allJobs, allJobs);

  container.querySelector('#job-search-input').addEventListener('input', () => filterAndRender(container, allJobs));
  container.querySelector('#job-status-filter').addEventListener('change', () => filterAndRender(container, allJobs));

  const filterToggle = container.querySelector('#jf-toggle');
  const filterPanel  = container.querySelector('#jf-panel');

  filterToggle.addEventListener('click', () => {
    filterPanel.classList.toggle('jf-panel--open');
    filterToggle.classList.toggle('jf-toggle--active');
  });

  function updateFilterBadge() {
    let count = filters.types.size + filters.locations.size + filters.departments.size;
    if (filters.datePosted !== 'any') count++;
    if (filters.minApplicants > 0) count++;
    const badge = container.querySelector('#jf-badge');
    badge.textContent = count;
    filterToggle.classList.toggle('jf-toggle--active', count > 0 || filterPanel.classList.contains('jf-panel--open'));
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }

  container.querySelectorAll('#jf-type-checks .jf-check').forEach(label => {
    label.addEventListener('click', e => {
      e.preventDefault();
      const cb = label.querySelector('input');
      cb.checked = !cb.checked;
      label.classList.toggle('jf-check--active', cb.checked);
      if (cb.checked) filters.types.add(cb.value); else filters.types.delete(cb.value);
      updateFilterBadge(); filterAndRender(container, allJobs);
    });
  });

  function triggerHTML(filterSet, placeholder) {
    const ch = icon('chevronDown', 12);
    if (!filterSet.size) return '<span class="jf-multiselect__placeholder">' + placeholder + '</span><span class="jf-multiselect__arrow">' + ch + '</span>';
    return '<div class="jf-multiselect__chips">' + [...filterSet].map(v => '<span class="jf-multiselect__chip">' + v + '<span class="jf-multiselect__chip-remove" data-val="' + v + '">&times;</span></span>').join('') + '</div><span class="jf-multiselect__arrow">' + ch + '</span>';
  }

  function initMultiSelect(triggerId, dropdownId, filterSet, placeholder) {
    const trigger   = container.querySelector('#' + triggerId);
    const dropdown  = container.querySelector('#' + dropdownId);
    const search    = dropdown.querySelector('.jf-multiselect__search');
    const options   = dropdown.querySelectorAll('.jf-multiselect__option');

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const open = dropdown.classList.contains('jf-multiselect__dropdown--open');
      document.querySelectorAll('.jf-multiselect__dropdown--open').forEach(d => d.classList.remove('jf-multiselect__dropdown--open'));
      if (!open) { dropdown.classList.add('jf-multiselect__dropdown--open'); trigger.classList.add('jf-multiselect__trigger--active'); search?.focus(); }
    });

    search?.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      options.forEach(o => { o.style.display = o.dataset.value.toLowerCase().includes(q) ? '' : 'none'; });
    });

    options.forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        const val = opt.dataset.value;
        if (filterSet.has(val)) { filterSet.delete(val); opt.classList.remove('jf-multiselect__option--selected'); }
        else { filterSet.add(val); opt.classList.add('jf-multiselect__option--selected'); }
        trigger.innerHTML = triggerHTML(filterSet, placeholder);
        trigger.classList.toggle('jf-multiselect__trigger--active', filterSet.size > 0);
        updateFilterBadge(); filterAndRender(container, allJobs);
      });
    });

    trigger.addEventListener('click', e => {
      const rb = e.target.closest('.jf-multiselect__chip-remove');
      if (!rb) return; e.stopPropagation();
      const val = rb.dataset.val;
      filterSet.delete(val);
      dropdown.querySelector('.jf-multiselect__option[data-value="' + val + '"]')?.classList.remove('jf-multiselect__option--selected');
      trigger.innerHTML = triggerHTML(filterSet, placeholder);
      trigger.classList.toggle('jf-multiselect__trigger--active', filterSet.size > 0);
      updateFilterBadge(); filterAndRender(container, allJobs);
    });
  }

  initMultiSelect('jf-loc-trigger','jf-loc-dropdown', filters.locations, 'All Locations');
  initMultiSelect('jf-dept-trigger','jf-dept-dropdown', filters.departments, 'All Departments');

  document.addEventListener('click', () => {
    container.querySelectorAll('.jf-multiselect__dropdown--open').forEach(d => d.classList.remove('jf-multiselect__dropdown--open'));
    container.querySelectorAll('.jf-multiselect__trigger--active').forEach(t => {
      const dd = t.closest('.jf-multiselect')?.querySelector('.jf-multiselect__dropdown');
      if (!dd?.querySelector('.jf-multiselect__option--selected')) t.classList.remove('jf-multiselect__trigger--active');
    });
  });

  container.querySelector('#jf-date-group').addEventListener('click', e => {
    const btn = e.target.closest('.jf-btn-group__btn');
    if (!btn) return;
    container.querySelectorAll('#jf-date-group .jf-btn-group__btn').forEach(b => b.classList.remove('jf-btn-group__btn--active'));
    btn.classList.add('jf-btn-group__btn--active');
    filters.datePosted = btn.dataset.value;
    updateFilterBadge(); filterAndRender(container, allJobs);
  });

  const appRange = container.querySelector('#jf-applicants');
  const appVal   = container.querySelector('#jf-applicants-val');
  appRange.addEventListener('input', () => {
    const v = parseInt(appRange.value);
    filters.minApplicants = v;
    appVal.textContent = v > 0 ? v + '+' : '0+';
    updateFilterBadge(); filterAndRender(container, allJobs);
  });

  container.querySelector('#jf-clear').addEventListener('click', () => {
    filters.types.clear(); filters.locations.clear(); filters.departments.clear();
    filters.datePosted = 'any'; filters.minApplicants = 0;
    container.querySelectorAll('#jf-type-checks .jf-check').forEach(l => { l.classList.remove('jf-check--active'); l.querySelector('input').checked = false; });
    container.querySelectorAll('.jf-multiselect__option--selected').forEach(o => o.classList.remove('jf-multiselect__option--selected'));
    [['jf-loc-trigger','All Locations'],['jf-dept-trigger','All Departments']].forEach(([id,ph]) => {
      const t = container.querySelector('#'+id);
      t.innerHTML = '<span class="jf-multiselect__placeholder">'+ph+'</span><span class="jf-multiselect__arrow">'+icon('chevronDown',12)+'</span>';
      t.classList.remove('jf-multiselect__trigger--active');
    });
    container.querySelectorAll('#jf-date-group .jf-btn-group__btn').forEach(b => b.classList.remove('jf-btn-group__btn--active'));
    container.querySelector('#jf-date-group .jf-btn-group__btn[data-value="any"]').classList.add('jf-btn-group__btn--active');
    appRange.value = 0; appVal.textContent = '0+';
    updateFilterBadge(); filterAndRender(container, allJobs);
  });
}

function updateStats(container, jobs) {
  container.querySelector('#stat-total').textContent = jobs.length;
  container.querySelector('#stat-open').textContent  = jobs.filter(j => j.status === 'open').length;
  container.querySelector('#stat-draft').textContent = jobs.filter(j => j.status === 'draft').length;
  container.querySelector('#stat-applicants').textContent = jobs.reduce((s,j) => s + (j.applicants ?? 0), 0);
}

function filterAndRender(container, allJobs) {
  const q = container.querySelector('#job-search-input').value.toLowerCase();
  const st = container.querySelector('#job-status-filter').value;
  let f = allJobs;
  if (st !== 'all') f = f.filter(j => j.status === st);
  if (q) f = f.filter(j => [(j.title||''),(j.department||''),(j.location||'')].some(s => s.toLowerCase().includes(q)));
  if (filters.types.size)       f = f.filter(j => filters.types.has(j.type));
  if (filters.locations.size)   f = f.filter(j => filters.locations.has(j.location));
  if (filters.departments.size) f = f.filter(j => filters.departments.has(j.department));
  if (filters.minApplicants > 0) f = f.filter(j => (j.applicants ?? 0) >= filters.minApplicants);
  if (filters.datePosted !== 'any') {
    const now = Date.now(), cuts = {today:86400000, week:604800000, month:2592000000}, c = cuts[filters.datePosted];
    if (c) f = f.filter(j => !j.created_at || (now - new Date(j.created_at).getTime()) <= c);
  }
  renderJobCards(container, f, allJobs);
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = Date.now();
  const diff = now - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  if (day < 30) return `${Math.floor(day / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getRoleIcon(job) {
  const text = `${job.department || ''} ${job.title || ''}`.toLowerCase();
  if (text.includes('design') || text.includes('ui') || text.includes('ux')) return icon('star', 17);
  if (text.includes('software') || text.includes('dev') || text.includes('tech') || text.includes('engineer') || text.includes('code')) return icon('layers', 17);
  if (text.includes('marketing') || text.includes('sales') || text.includes('business')) return icon('trendingUp', 17);
  if (text.includes('hr') || text.includes('talent') || text.includes('people') || text.includes('recruit')) return icon('users', 17);
  return icon('briefcase', 17);
}

function renderJobCards(container, jobs, allJobs) {
  jobs = jobs.map(j => ({...j, skills: Array.isArray(j.skills) ? j.skills : typeof j.skills==='string'&&j.skills.trim() ? j.skills.split(',').map(s=>s.trim()).filter(Boolean) : []}));

  const grid = container.querySelector('#jobs-grid');
  const rh = container.querySelector('#jp-results-header');
  const rc = container.querySelector('#jp-results-count');

  if (allJobs.length > 0) {
    rh.style.display = 'flex';
    rc.innerHTML = jobs.length === allJobs.length
      ? 'Showing <strong>' + jobs.length + '</strong> posting' + (jobs.length !== 1 ? 's' : '')
      : 'Showing <strong>' + jobs.length + '</strong> of <strong>' + allJobs.length + '</strong> postings';
  }

  if (!jobs.length) {
    grid.innerHTML = '<div class="jp-empty"><div class="jp-empty__icon">' + icon('briefcase', 30) + '</div><h3 class="jp-empty__title">No job postings found</h3><p class="jp-empty__text">Try adjusting your search or filters, or create your first job posting to start attracting talent.</p><button class="btn btn--primary" id="empty-post-btn">' + icon('plus', 15) + ' Post a Job</button></div>';
    grid.querySelector('#empty-post-btn')?.addEventListener('click', () => {
      const curCo = getState('company') || {};
      const curMoa = (curCo.moaStatus || '').toLowerCase();
      const curCanPost = curCo.canPostOpportunities !== undefined
        ? Boolean(curCo.canPostOpportunities)
        : (Boolean(curCo.profileCompleted) && ['active', 'expiring soon'].includes(curMoa));
      if (!curCanPost) {
        showPostingRestrictedModal('post job vacancies');
        return;
      }
      navigate('/post-job');
    });
    return;
  }

  const statusBadge = s => s==='open' ? 'open' : s==='draft' ? 'draft' : 'closed';
  const statusLabel = s => s==='open' ? 'Open' : s==='draft' ? 'Draft' : 'Closed';

  grid.innerHTML = jobs.map(job => {
    const timeAgo = formatRelativeTime(job.created_at);
    const applicantsCount = job.applicants ?? 0;
    const isApplicantActive = applicantsCount > 0;

    return `
    <div class="jp-card jp-card--${job.status}" data-job-id="${job.id}">
      <div class="jp-card__top-line"></div>
      <div class="jp-card__body">
        <div class="jp-card__header">
          <div class="jp-card__header-left">
            <div class="jp-card__role-badge jp-card__role-badge--${job.status || 'open'}">
              ${getRoleIcon(job)}
            </div>
            <div class="jp-card__title-wrap">
              <h3 class="jp-card__title" title="${job.title}">${job.title}</h3>
              <div class="jp-card__subtitle">
                ${job.department ? `<span class="jp-card__dept">${job.department}</span>` : ''}
                ${job.department && timeAgo ? `<span class="jp-card__dot-sep">•</span>` : ''}
                ${timeAgo ? `<span class="jp-card__date" title="Posted on ${new Date(job.created_at).toLocaleDateString()}">${icon('clock', 11)} ${timeAgo}</span>` : ''}
              </div>
            </div>
          </div>
          <div class="jp-card__header-right">
            <span class="jp-status-pill jp-status-pill--${statusBadge(job.status)}">
              <span class="jp-status-dot"></span>
              ${statusLabel(job.status)}
            </span>
          </div>
        </div>

        <div class="jp-card__meta-grid">
          ${job.location ? `
            <div class="jp-meta-item" title="Location">
              ${icon('mapPin', 12)}
              <span>${job.location}</span>
            </div>
          ` : ''}
          ${job.type ? `
            <div class="jp-meta-item jp-meta-item--type" title="Work Type">
              ${icon('clock', 12)}
              <span>${job.type}</span>
            </div>
          ` : ''}
          ${job.experience_level ? `
            <div class="jp-meta-item jp-meta-item--exp" title="Experience Level">
              ${icon('award', 12)}
              <span>${job.experience_level}</span>
            </div>
          ` : ''}
          ${job.salary ? `
            <div class="jp-meta-item jp-meta-item--salary" title="Salary / Compensation">
              ${icon('dollarSign', 12)}
              <span>${job.salary}</span>
            </div>
          ` : `
            <div class="jp-meta-item jp-meta-item--salary" title="Salary">
              ${icon('dollarSign', 12)}
              <span>Negotiable</span>
            </div>
          `}
        </div>

        <p class="jp-card__desc">${job.description ? job.description : '<span class="jp-card__desc--empty">No description preview provided for this role.</span>'}</p>

        ${job.skills?.length ? `
          <div class="jp-card__skills">
            ${job.skills.slice(0, 4).map(s => `<span class="jp-skill-chip">${s}</span>`).join('')}
            ${job.skills.length > 4 ? `<span class="jp-skill-chip jp-skill-chip--more" title="${job.skills.slice(4).join(', ')}">+${job.skills.length - 4}</span>` : ''}
          </div>
        ` : ''}
      </div>

      <div class="jp-card__footer">
        <div class="jp-card__applicant-stat ${isApplicantActive ? 'jp-card__applicant-stat--active' : ''}">
          <div class="jp-card__applicant-icon-wrap">
            ${icon('users', 14)}
          </div>
          <div class="jp-card__applicant-info">
            <span class="jp-card__applicant-count">${applicantsCount}</span>
            <span class="jp-card__applicant-label">${applicantsCount === 1 ? 'Applicant' : 'Applicants'}</span>
          </div>
        </div>

        <div class="jp-card__actions">
          <button class="btn btn--outline btn--sm btn--view-job" data-id="${job.id}" title="View Details">
            ${icon('eye', 13)} <span>View</span>
          </button>
          <button class="btn btn--outline btn--sm btn--edit-job" data-id="${job.id}" title="Edit Job Posting">
            ${icon('edit', 13)} <span>Edit</span>
          </button>
          <button class="btn btn--outline btn--sm btn--danger-ghost btn--del-job" data-id="${job.id}" title="Delete Posting">
            ${icon('trash', 13)}
          </button>
        </div>
      </div>
    </div>
  `}).join('');

  grid.querySelectorAll('.btn--view-job').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    showJobDetail(container, allJobs.find(j=>String(j.id)===b.dataset.id));
  }));
  grid.querySelectorAll('.btn--edit-job').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate('/post-job?edit='+b.dataset.id);
  }));
  grid.querySelectorAll('.btn--del-job').forEach(b => b.addEventListener('click', (e) => {
    e.stopPropagation();
    confirmDeleteJob(b.dataset.id, container, allJobs);
  }));
  grid.querySelectorAll('.jp-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.jp-card__actions') || e.target.closest('button')) return;
      const job = allJobs.find(j => String(j.id) === card.dataset.jobId);
      if (job) showJobDetail(container, job);
    });
  });
}

async function confirmDeleteJob(jobId, container, allJobs) {
  if (!confirm('Delete this job posting? This cannot be undone.')) return;
  const res = await apiDelete('/company/jobs/' + jobId);
  if (res?.success) {
    const updated = allJobs.filter(j => String(j.id) !== String(jobId));
    allJobs.length = 0; allJobs.push(...updated);
    updateStats(container, allJobs);
    filterAndRender(container, allJobs);
  }
}

function showJobDetail(container, job) {
  if (!job) return;
  const skills = Array.isArray(job.skills) ? job.skills
    : typeof job.skills==='string'&&job.skills.trim() ? job.skills.split(',').map(s=>s.trim()).filter(Boolean) : [];
  job = {...job, skills};

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';

  const sc = {open:'#005930',draft:'#d97706',closed:'#6b7280'}[job.status]||'#6b7280';
  const sb = {open:'#e6f4ed',draft:'#fef3c7',closed:'#f9fafb'}[job.status]||'#f9fafb';

  const section = (ic, title, items, isList=true) => {
    if (!items?.length) return '';
    const c = isList ? '<ul class="jd-list">' + items.map(r=>'<li class="jd-list__item">'+icon('chevronRight',11)+' <span>'+r+'</span></li>').join('') + '</ul>' : '<p class="jd-desc">'+items+'</p>';
    return '<div class="jd-section"><h5 class="jd-section__title">'+icon(ic,12)+' '+title+'</h5>'+c+'</div>';
  };

  const initials = t => (t||'?').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';

  backdrop.innerHTML = `
    <div class="modal modal--visible jd-modal" style="max-width:660px;">
      <div style="background:linear-gradient(135deg,var(--color-primary-dark) 0%,var(--color-primary) 100%);padding:22px 24px 20px;position:relative;">
        <button class="jd-modal__close-btn" id="modal-close">${icon('x',15)}</button>
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="width:52px;height:52px;border-radius:12px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;color:#fff;flex-shrink:0;letter-spacing:-.02em;">${initials(job.title)}</div>
          <div>
            <h3 style="color:#fff;font-size:1.1rem;font-weight:700;margin:0 0 5px;line-height:1.2;">${job.title}</h3>
            ${job.department ? '<p style="color:rgba(255,255,255,.75);font-size:.8rem;margin:0;">' + job.department + '</p>' : ''}
          </div>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:14px 24px;border-bottom:1px solid var(--border-default);background:var(--bg-secondary);">
        <span class="jd-pill" style="background:${sb};color:${sc};border-color:${sc}25;">${(job.status||'').toUpperCase()}</span>
        ${job.location ? '<span class="jd-pill">'+icon('mapPin',11)+' '+job.location+'</span>' : ''}
        ${job.type     ? '<span class="jd-pill">'+icon('clock',11)+' '+job.type+'</span>' : ''}
        ${job.experience_level ? '<span class="jd-pill">'+icon('award',11)+' '+job.experience_level+'</span>' : ''}
        ${job.salary   ? '<span class="jd-pill">'+icon('dollarSign',11)+' '+job.salary+'</span>' : ''}
        <span class="jd-pill">${icon('users',11)} ${job.applicants??0} applicant${(job.applicants??0)!==1?'s':''}</span>
        ${job.expires_at ? '<span class="jd-pill">'+icon('calendar',11)+' Expires '+job.expires_at+'</span>' : ''}
      </div>
      <div class="modal__body" style="max-height:calc(85vh - 230px);overflow-y:auto;padding:0 24px 16px;">
        ${section('fileText','Description',job.description,false)}
        ${section('checkCircle','Responsibilities',job.responsibilities)}
        ${section('alertCircle','Requirements',job.requirements)}
        ${section('star','Benefits',job.benefits)}
        ${skills.length ? '<div class="jd-section"><h5 class="jd-section__title">'+icon('zap',12)+' Required Skills</h5><div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;">'+skills.map(s=>'<span class="jd-skill-chip">'+s+'</span>').join('')+'</div></div>' : ''}
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="modal-cancel">Close</button>
        <button class="btn btn--primary" id="modal-edit">${icon('edit',14)} Edit Job</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.querySelector('#modal-close').addEventListener('click', () => backdrop.remove());
  backdrop.querySelector('#modal-cancel').addEventListener('click', () => backdrop.remove());
  backdrop.querySelector('#modal-edit').addEventListener('click', () => { backdrop.remove(); navigate('/post-job?edit='+job.id); });
  backdrop.addEventListener('click', e => { if (e.target===backdrop) backdrop.remove(); });
}

function skeletonCards(n) {
  return Array.from({length:n}, () => `
    <div class="jp-card" style="min-height:220px;">
      <div style="height:3px;background:var(--bg-tertiary);"></div>
      <div class="jp-card__body">
        <div class="jp-card__header">
          <div class="jp-card__header-left">
            <div class="skeleton" style="width:42px;height:42px;border-radius:12px;flex-shrink:0;"></div>
            <div style="flex:1;">
              <div class="skeleton skeleton--text" style="width:55%;margin-bottom:8px;"></div>
              <div class="skeleton skeleton--text-sm" style="width:38%;"></div>
            </div>
          </div>
          <div class="skeleton" style="width:68px;height:24px;border-radius:99px;flex-shrink:0;"></div>
        </div>

        <div style="display:flex;gap:8px;margin:4px 0;">
          <div class="skeleton" style="width:96px;height:24px;border-radius:6px;"></div>
          <div class="skeleton" style="width:80px;height:24px;border-radius:6px;"></div>
          <div class="skeleton" style="width:90px;height:24px;border-radius:6px;"></div>
        </div>

        <div class="skeleton skeleton--text-sm" style="width:95%;"></div>
        <div class="skeleton skeleton--text-sm" style="width:70%;"></div>

        <div style="display:flex;gap:6px;margin-top:auto;">
          <div class="skeleton" style="width:52px;height:22px;border-radius:6px;"></div>
          <div class="skeleton" style="width:64px;height:22px;border-radius:6px;"></div>
          <div class="skeleton" style="width:48px;height:22px;border-radius:6px;"></div>
        </div>
      </div>

      <div class="jp-card__footer">
        <div class="skeleton" style="width:110px;height:30px;border-radius:8px;"></div>
        <div style="display:flex;gap:6px;">
          <div class="skeleton" style="width:62px;height:28px;border-radius:7px;"></div>
          <div class="skeleton" style="width:58px;height:28px;border-radius:7px;"></div>
          <div class="skeleton" style="width:30px;height:28px;border-radius:7px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}