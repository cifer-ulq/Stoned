/* ── Job Postings Page — Admin Portal (Redesigned) ── */
import { apiGet, apiGetCached, getCached } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';

const statusColors = { Active: 'success', Pending: 'warning', Expired: 'danger', Draft: 'neutral' };
const typeColors = { 'Full-time': 'info', 'Part-time': 'warning', Contract: 'neutral', Freelance: 'primary', Remote: 'success', Internship: 'success' };

function num(n) { return (n ?? 0).toLocaleString(); }
function pct(part, total) { return total > 0 ? Math.round((part / total) * 100) : 0; }

/* ── Analytics helpers ── */
function bar(label, value, total, color) {
  const p = pct(value, total);
  return `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-size:var(--text-xs);color:var(--text-secondary);">${label}</span>
        <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);">${num(value)} <span style="color:var(--text-tertiary);font-weight:400;">(${p}%)</span></span>
      </div>
      <div style="height:7px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
        <div style="height:100%;width:${p}%;background:${color};border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
      </div>
    </div>
  `;
}

function renderJobAnalytics(jobs, container) {
  if (!container) return; // guard: user may have navigated away
  const total      = jobs.length;
  const active     = jobs.filter(j => j.status === 'Active').length;
  const draft      = jobs.filter(j => j.status === 'Draft').length;
  const expired    = jobs.filter(j => j.status === 'Expired').length;
  const pending    = jobs.filter(j => j.status === 'Pending').length;
  const totalApps  = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
  const avgApps    = total > 0 ? (totalApps / total).toFixed(1) : 0;
  const withApps   = jobs.filter(j => j.applicants > 0).length;

  // Types breakdown
  const typeMap = {};
  jobs.forEach(j => { if (j.type) typeMap[j.type] = (typeMap[j.type] || 0) + 1; });
  const typeSorted = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  // Top skills — normalize skills to array (guards against null, JSON string, or non-array values)
  const skillMap = {};
  jobs.forEach(j => {
    const skills = Array.isArray(j.skills)
      ? j.skills
      : (typeof j.skills === 'string' ? (() => { try { const p = JSON.parse(j.skills); return Array.isArray(p) ? p : []; } catch { return []; } })() : []);
    skills.forEach(sk => { skillMap[sk] = (skillMap[sk] || 0) + 1; });
  });
  const topSkills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSkill  = topSkills[0]?.[1] || 1;

  // Top companies
  const compMap = {};
  jobs.forEach(j => { if (j.company) compMap[j.company] = (compMap[j.company] || 0) + 1; });
  const topCompanies = Object.entries(compMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Top companies by applicants
  const compApps = {};
  jobs.forEach(j => { if (j.company) compApps[j.company] = (compApps[j.company] || 0) + (j.applicants || 0); });
  const topByApps = Object.entries(compApps).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxApps   = topByApps[0]?.[1] || 1;

  const typeColorMap = {
    'Full-time': '#6366F1', 'Part-time': '#F59E0B', 'Contract': '#94A3B8',
    'Freelance': '#8B5CF6', 'Remote': '#10B981', 'Internship': '#14B8A6',
  };

  container.innerHTML = `
    <!-- KPI Strip -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-4);">
      ${[
        { label: 'Total Postings',    value: num(total),    ic: 'clipboard', color: '#6366F1' },
        { label: 'Active Now',        value: num(active),   ic: 'check',     color: '#10B981' },
        { label: 'Total Applicants',  value: num(totalApps),ic: 'users',     color: '#3B82F6' },
        { label: 'Avg. per Posting',  value: avgApps,       ic: 'target',    color: '#F59E0B' },
      ].map(k => `
        <div class="stat-card" style="--stat-accent:${k.color};">
          <div class="stat-card__top">
            <div class="stat-card__icon" style="background:${k.color}18;color:${k.color};">${icon(k.ic, 18)}</div>
          </div>
          <div class="stat-card__body">
            <div class="stat-card__value" style="font-size:var(--text-xl);">${k.value}</div>
            <div class="stat-card__label">${k.label}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4);">

      <!-- By Status -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${icon('clipboard', 14)} Postings by Status</h3>
        </div>
        <div class="card__body">
          ${bar('Active',  active,  total, '#10B981')}
          ${bar('Draft',   draft,   total, '#94A3B8')}
          ${bar('Expired', expired, total, '#EF4444')}
          ${pending ? bar('Pending', pending, total, '#F59E0B') : ''}
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border-default);display:flex;justify-content:space-between;">
            <span style="font-size:var(--text-xs);color:var(--text-tertiary);">Postings with applicants</span>
            <span style="font-size:var(--text-sm);font-weight:var(--weight-semibold);">${withApps} / ${total}</span>
          </div>
        </div>
      </div>

      <!-- By Employment Type -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${icon('briefcase', 14)} By Employment Type</h3>
        </div>
        <div class="card__body">
          ${typeSorted.length ? typeSorted.map(([type, count]) =>
            bar(type, count, total, typeColorMap[type] || '#6366F1')
          ).join('') : '<p style="font-size:var(--text-sm);color:var(--text-tertiary);">No type data</p>'}
        </div>
      </div>

      <!-- Top In-Demand Skills -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${icon('star', 14)} Top In-Demand Skills</h3>
          <span class="badge badge--info">Top 8</span>
        </div>
        <div class="card__body">
          ${topSkills.length ? topSkills.map(([skill, count], i) => {
            const colors = ['#6366F1','#10B981','#F59E0B','#3B82F6','#EC4899','#14B8A6','#8B5CF6','#EF4444'];
            const p2 = Math.round((count / maxSkill) * 100);
            return `
              <div style="margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                  <span style="font-size:var(--text-xs);color:var(--text-secondary);">${skill}</span>
                  <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:${colors[i % colors.length]};">${count} job${count !== 1 ? 's' : ''}</span>
                </div>
                <div style="height:6px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
                  <div style="height:100%;width:${p2}%;background:${colors[i % colors.length]};border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
                </div>
              </div>
            `;
          }).join('') : '<p style="font-size:var(--text-sm);color:var(--text-tertiary);">No skills data</p>'}
        </div>
      </div>

      <!-- Top Companies by Applicants -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">${icon('award', 14)} Top Companies by Applicants</h3>
        </div>
        <div class="card__body">
          ${topByApps.length ? topByApps.map(([company, apps], i) => {
            const p2 = Math.round((apps / maxApps) * 100);
            return `
              <div style="margin-bottom:10px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:var(--text-xs);font-weight:var(--weight-bold);color:var(--text-tertiary);min-width:14px;">${i + 1}</span>
                    <span style="font-size:var(--text-xs);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">${company}</span>
                  </div>
                  <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);white-space:nowrap;">${num(apps)} applicants</span>
                </div>
                <div style="height:6px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
                  <div style="height:100%;width:${p2}%;background:#6366F1;border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
                </div>
              </div>
            `;
          }).join('') : '<p style="font-size:var(--text-sm);color:var(--text-tertiary);">No applicant data</p>'}
        </div>
      </div>

    </div>
  `;

  renderIcons(container);
}

export default async function JobPostingsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Job Postings</h1>
      <p class="page-header__subtitle">Review, approve, and manage all job listings from partner companies</p>
    </div>
    <div id="jobs-analytics"></div>
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="search-box">${icon('search', 15)}<input class="search-box__input" id="job-search" placeholder="Search postings..." /></div>
        <select class="form-select" id="filter-status" style="width:auto;padding:7px 32px 7px 10px;"><option value="">All Status</option><option>Active</option><option>Pending</option><option>Expired</option><option>Draft</option></select>
        <select class="form-select" id="filter-type" style="width:auto;padding:7px 32px 7px 10px;"><option value="">All Types</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Freelance</option><option>Remote</option><option>Internship</option></select>
      </div>
      <div class="toolbar__right">
        <button class="btn btn--outline btn--sm">${icon('download', 14)} Export</button>
      </div>
    </div>
    <div id="jobs-grid" class="entity-grid anim-stagger"></div>
  `;

  // Capture DOM refs NOW (before any await) so navigation can't nullify them
  const grid      = container.querySelector('#jobs-grid');
  const analytics = container.querySelector('#jobs-analytics');

  renderIcons();

  let jobs = [];
  let filtered = [];

  const cached = getCached('/admin/jobs');
  if (cached?.data) {
    jobs = Array.isArray(cached.data) ? cached.data : [];
    filtered = [...jobs];
    renderJobAnalytics(jobs, analytics);
  } else {
    grid.innerHTML = `<div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:10px;padding:48px 0;color:var(--text-tertiary);font-size:var(--text-sm);"><span class="spinner-sm"></span> Loading job postings…</div>`;
  }

  apiGetCached('/admin/jobs', {
    onUpdate: (fresh) => {
      if (!grid || !grid.isConnected) return;
      jobs = Array.isArray(fresh) ? fresh : [];
      renderJobAnalytics(jobs, analytics);
      applyFilters();
    },
  }).then(res => {
    if (!cached && res) {
      if (!grid || !grid.isConnected) return;
      jobs = Array.isArray(res) ? res : [];
      renderJobAnalytics(jobs, analytics);
      applyFilters();
    }
  }).catch(() => {
    if (!cached && grid && grid.isConnected) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><h3 class="empty-state__title">Failed to load</h3><p class="empty-state__text">Could not connect to the server.</p></div>`;
    }
  });

  function render(list) {
    if (!grid || !grid.isConnected) return;
    grid.innerHTML = list.length ? list.map(j => `
      <div class="entity-card anim-fade-in-up">
        <div class="entity-card__header">
          <div class="entity-card__avatar" style="background:var(--color-primary);color:#fff;">${j.company?.[0] || 'J'}</div>
          <div class="entity-card__info">
            <p class="entity-card__name">${j.title}</p>
            <p class="entity-card__sub">${j.company || 'Unknown Company'}</p>
          </div>
          <span class="badge badge--${statusColors[j.status] || 'neutral'}">${j.status}</span>
        </div>
        <div class="entity-card__meta">
          <span>${icon('map-pin', 11)} ${j.location || 'Unspecified'}</span>
          <span><span class="badge badge--${typeColors[j.type] || 'neutral'}" style="font-size:0.6rem;">${j.type}</span></span>
        </div>
        <div class="entity-card__meta">
          <span>${icon('users', 11)} ${j.applicants || 0} applicants</span>
          <span>${icon('calendar', 11)} ${j.posted || 'N/A'}</span>
        </div>
        ${(() => { const s = Array.isArray(j.skills) ? j.skills : (typeof j.skills === 'string' ? (() => { try { const p = JSON.parse(j.skills); return Array.isArray(p) ? p : []; } catch { return []; } })() : []); return s.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">${s.slice(0,3).map(sk => `<span class="skill-tag">${sk}</span>`).join('')}${s.length > 3 ? `<span class="skill-tag">+${s.length-3}</span>` : ''}</div>` : ''; })()}

        <div class="entity-card__actions">
          <button class="btn btn--ghost btn--sm">${icon('eye', 13)} View</button>
          ${j.status === 'Pending' ? `<button class="btn btn--primary btn--sm">${icon('check', 13)} Approve</button>` : `<button class="btn btn--ghost btn--sm">${icon('edit', 13)} Edit</button>`}
        </div>
      </div>
    `).join('') : `<div class="empty-state" style="grid-column:1/-1;"><h3 class="empty-state__title">No job postings found</h3><p class="empty-state__text">Try adjusting your filters</p></div>`;
    renderIcons();
  }

  render(filtered);

  function applyFilters() {
    const q = container.querySelector('#job-search').value.toLowerCase();
    const st = container.querySelector('#filter-status').value;
    const ty = container.querySelector('#filter-type').value;
    filtered = jobs.filter(j => {
      if (q && !j.title.toLowerCase().includes(q) && !(j.company || '').toLowerCase().includes(q)) return false;
      if (st && j.status !== st) return false;
      if (ty && j.type !== ty) return false;
      return true;
    });
    render(filtered);
  }

  container.querySelector('#job-search')?.addEventListener('input', applyFilters);
  container.querySelector('#filter-status')?.addEventListener('change', applyFilters);
  container.querySelector('#filter-type')?.addEventListener('change', applyFilters);
}
