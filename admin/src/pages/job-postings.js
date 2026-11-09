/* ── Job Postings Page — Admin Portal ── */
import { apiGetCached, getCached } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';
import { renderDataTable, escapeHtml } from '../components/data-table.js';
import { paginateItems, renderPagination } from '../components/pagination.js';
import {
  disposeJobCharts,
  normalizeSkills,
  renderSkillsBarChart,
  renderEmploymentDonutChart,
  renderCompaniesLollipopChart,
} from '../components/job-charts.js';

const PAGE_SIZE = 5;

const STATUS_SLUG = {
  Active: 'active',
  Pending: 'pending',
  Expired: 'expired',
  Draft: 'draft',
  Filled: 'filled',
};

const TYPE_SLUG = {
  'Full-time': 'fulltime',
  'Remote': 'remote',
  'Part-time': 'part-time',
  'Contract': 'contract',
  'Freelance': 'freelance',
  'Internship': 'internship',
};

function num(n) { return (n ?? 0).toLocaleString(); }
function pct(part, total) { return total > 0 ? Math.round((part / total) * 100) : 0; }

/* ── Legacy bar helper kept for Postings by Status card ── */
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

function renderStatusPill(status) {
  const label = status || 'Unknown';
  const slug = STATUS_SLUG[label] || 'draft';
  return `
    <span class="jp-status-pill jp-status-pill--${slug}">
      <span class="jp-status-dot" aria-hidden="true"></span>
      ${escapeHtml(label)}
    </span>
  `;
}

function renderTypePill(type) {
  const label = (type || '').trim() || 'Unspecified';
  const slug = TYPE_SLUG[label] || 'default';
  return `<span class="jp-type-pill jp-type-pill--${slug}">${escapeHtml(label)}</span>`;
}

function renderAnalyticsSkeleton(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="jp-kpi-grid" aria-busy="true">
      ${Array.from({ length: 4 }, () => `
        <div class="stat-card">
          <div class="stat-card__top">
            <div class="skeleton" style="width:40px;height:40px;border-radius:var(--radius-lg);"></div>
          </div>
          <div class="stat-card__body">
            <div class="skeleton" style="width:54px;height:22px;margin-bottom:6px;"></div>
            <div class="skeleton" style="width:96px;height:13px;"></div>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="jp-charts-grid" aria-busy="true">
      ${Array.from({ length: 4 }, () => `
        <div class="card jp-chart-card">
          <div class="card__header">
            <div class="skeleton" style="width:160px;height:16px;"></div>
          </div>
          <div class="card__body">
            <div class="skeleton" style="width:100%;height:190px;border-radius:var(--radius-lg);"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderJobAnalytics(jobs, container) {
  if (!container) return; // guard: user may have navigated away

  disposeJobCharts(container);

  const total      = jobs.length;
  const active     = jobs.filter(j => j.status === 'Active').length;
  const draft      = jobs.filter(j => j.status === 'Draft').length;
  const expired    = jobs.filter(j => j.status === 'Expired').length;
  const pending    = jobs.filter(j => j.status === 'Pending').length;
  const totalApps  = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
  const avgApps    = total > 0 ? (totalApps / total).toFixed(1) : '0.0';
  const withApps   = jobs.filter(j => (j.applicants || 0) > 0).length;

  const kpis = [
    {
      label: 'Total Postings',
      value: num(total),
      ic: 'clipboard',
      accent: 'var(--color-primary-light)',
      bg: 'var(--color-primary-bg)',
      fg: 'var(--color-primary-light)',
    },
    {
      label: 'Active Now',
      value: num(active),
      ic: 'check',
      accent: 'var(--color-success)',
      bg: 'var(--color-success-bg)',
      fg: 'var(--color-success)',
    },
    {
      label: 'Total Applicants',
      value: num(totalApps),
      ic: 'users',
      accent: 'var(--color-primary)',
      bg: 'color-mix(in srgb, var(--color-primary-light) 14%, transparent)',
      fg: 'var(--color-primary-light)',
    },
    {
      label: 'Avg. per Posting',
      value: avgApps,
      ic: 'target',
      accent: 'var(--color-warning)',
      bg: 'var(--color-warning-bg)',
      fg: 'var(--color-warning)',
    },
  ];

  container.innerHTML = `
    <!-- KPI Strip -->
    <div class="jp-kpi-grid">
      ${kpis.map(k => `
        <div class="stat-card" style="--stat-accent:${k.accent};--kpi-bg:${k.bg};--kpi-fg:${k.fg};">
          <div class="stat-card__top">
            <div class="stat-card__icon jp-kpi-icon">${icon(k.ic, 18)}</div>
          </div>
          <div class="stat-card__body">
            <div class="stat-card__value jp-kpi-value">${k.value}</div>
            <div class="stat-card__label">${k.label}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Charts Row -->
    <div class="jp-charts-grid">

      <!-- By Status (Kept as is) -->
      <div class="card jp-chart-card">
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

      <!-- By Employment Type (Donut Chart) -->
      <div class="card jp-chart-card">
        <div class="card__header">
          <h3 class="card__title">${icon('briefcase', 14)} By Employment Type</h3>
        </div>
        <div class="card__body" id="jp-chart-types"></div>
      </div>

      <!-- Top In-Demand Skills (Horizontal Bar Chart) -->
      <div class="card jp-chart-card">
        <div class="card__header">
          <h3 class="card__title">${icon('star', 14)} Top In-Demand Skills</h3>
          <span class="badge jp-top-badge">Top 8</span>
        </div>
        <div class="card__body" id="jp-chart-skills"></div>
      </div>

      <!-- Top Companies by Applicants (Lollipop Chart) -->
      <div class="card jp-chart-card">
        <div class="card__header">
          <h3 class="card__title">${icon('award', 14)} Top Companies by Applicants</h3>
          <span id="jp-companies-badge"></span>
        </div>
        <div class="card__body" id="jp-chart-companies"></div>
      </div>

    </div>
  `;

  renderEmploymentDonutChart(container.querySelector('#jp-chart-types'), jobs);
  renderSkillsBarChart(container.querySelector('#jp-chart-skills'), jobs);
  renderCompaniesLollipopChart(
    container.querySelector('#jp-chart-companies'),
    jobs,
    container.querySelector('#jp-companies-badge'),
  );

  renderIcons(container);
}

function normalizeStringArray(val) {
  if (Array.isArray(val)) return val.map(x => String(x ?? '').trim()).filter(Boolean);
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(x => String(x ?? '').trim()).filter(Boolean);
    } catch {
      return [];
    }
  }
  return [];
}

function openJobDetailModal(job, triggerEl = null) {
  if (!job) return;

  document.querySelectorAll('.jp-job-modal-backdrop').forEach(el => el.remove());

  const skills = normalizeSkills(job.skills);
  const responsibilities = normalizeStringArray(job.responsibilities);
  const requirements = normalizeStringArray(job.requirements);
  const benefits = normalizeStringArray(job.benefits);
  const company = job.company || 'Unknown Company';
  const companyInitial = company[0]?.toUpperCase() || 'J';
  const applicants = Number(job.applicants) || 0;

  const listSection = (ic, title, items) => {
    if (!items.length) return '';
    return `
      <div class="jp-detail-section">
        <h4 class="jp-detail-section__title">${icon(ic, 13)} ${title}</h4>
        <ul class="jp-detail-list">
          ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `;
  };

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop jp-job-modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal cvm-modal jp-modal" role="dialog" aria-modal="true" aria-labelledby="jp-modal-title">
      <div class="cvm-hero">
        <div class="jp-modal__hero-top">
          <div class="cvm-hero__identity" style="margin-bottom:0;">
            <div class="cvm-hero__avatar">${escapeHtml(companyInitial)}</div>
            <div style="min-width:0;">
              <h2 class="cvm-hero__name" id="jp-modal-title">${escapeHtml(job.title || 'Untitled Position')}</h2>
              <p class="cvm-hero__sub">
                <span>${icon('building-2', 13)} ${escapeHtml(company)}</span>
                ${job.department ? `<span>&bull;</span><span>${escapeHtml(job.department)}</span>` : ''}
              </p>
            </div>
          </div>
          <button type="button" class="modal__close jp-modal__close" id="jp-modal-close" aria-label="Close modal">
            ${icon('x', 16)}
          </button>
        </div>

        <div class="jp-modal__pills">
          ${renderStatusPill(job.status)}
          ${renderTypePill(job.type)}
          ${job.experience_level ? `<span class="jp-modal__meta-pill">${icon('award', 12)} ${escapeHtml(job.experience_level)}</span>` : ''}
          ${job.salary_range ? `<span class="jp-modal__meta-pill">${icon('layers', 12)} ${escapeHtml(job.salary_range)}</span>` : ''}
        </div>
      </div>

      <div class="modal__body jp-modal__body">
        <div class="jp-modal__tiles">
          <div class="jp-modal__tile">
            <span class="jp-modal__tile-lbl">${icon('users', 12)} Applicants</span>
            <span class="jp-modal__tile-val">${applicants.toLocaleString()}</span>
          </div>
          <div class="jp-modal__tile">
            <span class="jp-modal__tile-lbl">${icon('map-pin', 12)} Location</span>
            <span class="jp-modal__tile-val">${escapeHtml(job.location || 'Unspecified')}</span>
          </div>
          <div class="jp-modal__tile">
            <span class="jp-modal__tile-lbl">${icon('calendar', 12)} Date Posted</span>
            <span class="jp-modal__tile-val">${escapeHtml(job.posted || 'N/A')}</span>
          </div>
          <div class="jp-modal__tile">
            <span class="jp-modal__tile-lbl">${icon('clock', 12)} Expires</span>
            <span class="jp-modal__tile-val">${escapeHtml(job.expires_at || 'No expiry set')}</span>
          </div>
        </div>

        <div class="jp-detail-section">
          <h4 class="jp-detail-section__title">${icon('file-text', 13)} Description</h4>
          ${job.description
            ? `<p class="jp-detail-section__desc">${escapeHtml(job.description)}</p>`
            : `<p class="jp-detail-section__muted">No detailed description available for this posting.</p>`}
        </div>

        ${listSection('check-circle', 'Responsibilities', responsibilities)}
        ${listSection('alert-circle', 'Requirements', requirements)}
        ${listSection('star', 'Benefits', benefits)}

        ${skills.length ? `
          <div class="jp-detail-section">
            <h4 class="jp-detail-section__title">${icon('zap', 13)} Required Skills</h4>
            <div class="jp-modal__skills">
              ${skills.map(sk => `<span class="skill-tag">${escapeHtml(sk)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="modal__footer">
        <button type="button" class="btn btn--outline" id="jp-modal-close-btn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const closeModal = () => {
    document.removeEventListener('keydown', onKeyDown);
    backdrop.remove();
    if (triggerEl && typeof triggerEl.focus === 'function' && triggerEl.isConnected) {
      triggerEl.focus();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
  };

  document.addEventListener('keydown', onKeyDown);
  backdrop.querySelector('#jp-modal-close')?.addEventListener('click', closeModal);
  backdrop.querySelector('#jp-modal-close-btn')?.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.querySelector('#jp-modal-close')?.focus();
}

export default async function JobPostingsPage(container) {
  const prevState = container._jpState || { search: '', status: '', type: '', page: 1 };
  const state = {
    search: prevState.search || '',
    status: prevState.status || '',
    type: prevState.type || '',
    page: Math.max(1, Number(prevState.page) || 1),
  };
  container._jpState = state;

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
    <div id="jobs-table-container"></div>
  `;

  // Capture DOM refs before awaiting network calls
  const tableContainer = container.querySelector('#jobs-table-container');
  const analytics      = container.querySelector('#jobs-analytics');
  const searchInput    = container.querySelector('#job-search');
  const statusSelect   = container.querySelector('#filter-status');
  const typeSelect     = container.querySelector('#filter-type');

  // Restore active filters across keep-alive / SWR refreshes
  searchInput.value = state.search;
  statusSelect.value = state.status;
  typeSelect.value = state.type;

  renderIcons();

  let jobs = [];
  let filtered = [];
  let loadError = false;

  const columns = [
    {
      key: 'title',
      label: 'Job Title',
      skeletonWidth: '78%',
      render: (j) => {
        const skills = normalizeSkills(j.skills);
        const title = j.title || 'Untitled Position';
        return `
          <div class="jp-title-cell">
            <span class="jp-title-text" title="${escapeHtml(title)}">${escapeHtml(title)}</span>
            ${skills.length ? `
              <div class="jp-skills-row">
                ${skills.slice(0, 2).map(sk => `<span class="skill-tag">${escapeHtml(sk)}</span>`).join('')}
                ${skills.length > 2 ? `<span class="skill-tag">+${skills.length - 2}</span>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      },
    },
    {
      key: 'company',
      label: 'Company',
      skeletonWidth: '72%',
      render: (j) => {
        const company = j.company || 'Unknown Company';
        const initial = company[0]?.toUpperCase() || 'J';
        return `
          <div class="jp-company-cell" title="${escapeHtml(company)}">
            <div class="jp-comp-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
            <span class="jp-company-name">${escapeHtml(company)}</span>
          </div>
        `;
      },
    },
    {
      key: 'type',
      label: 'Employment Type',
      skeletonWidth: '84px',
      render: (j) => renderTypePill(j.type),
    },
    {
      key: 'location',
      label: 'Location',
      skeletonWidth: '75%',
      render: (j) => {
        const loc = j.location || 'Unspecified';
        return `
          <span class="jp-location-cell" title="${escapeHtml(loc)}">
            ${icon('map-pin', 12)}
            <span class="jp-location-text">${escapeHtml(loc)}</span>
          </span>
        `;
      },
    },
    {
      key: 'status',
      label: 'Status',
      skeletonWidth: '74px',
      render: (j) => renderStatusPill(j.status),
    },
    {
      key: 'posted',
      label: 'Date Posted',
      skeletonWidth: '86px',
      render: (j) => `
        <div class="jp-date-cell">
          <span class="jp-date-posted">${escapeHtml(j.posted || 'N/A')}</span>
          ${j.expires_at ? `<span class="jp-date-expires">Exp: ${escapeHtml(j.expires_at)}</span>` : ''}
        </div>
      `,
    },
    {
      key: 'applicants',
      label: 'Applicants',
      align: 'right',
      skeletonWidth: '48px',
      render: (j) => {
        const count = Number(j.applicants) || 0;
        return `
          <span class="jp-applicants-pill${count > 0 ? ' jp-applicants-pill--has' : ''}">
            ${icon('users', 12)}
            <span>${count.toLocaleString()}</span>
          </span>
        `;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      skeletonWidth: '76px',
      render: (j) => `
        <div class="cp-actions-cell">
          <button
            type="button"
            class="cp-action-btn cp-action-btn--primary btn-view-job"
            data-id="${escapeHtml(j.id)}"
            title="View job details"
            aria-label="View ${escapeHtml(j.title || 'job')}"
          >
            ${icon('eye', 13)}
            <span>View</span>
          </button>
        </div>
      `,
    },
  ];

  function renderMobileCard(j) {
    const company = j.company || 'Unknown Company';
    const initial = company[0]?.toUpperCase() || 'J';
    const skills = normalizeSkills(j.skills);
    const count = Number(j.applicants) || 0;
    return `
      <div class="jp-mobile-card anim-fade-in-up" data-row-id="${escapeHtml(j.id)}">
        <div class="jp-mobile-card__top">
          <div class="jp-mobile-card__identity">
            <div class="jp-comp-avatar" aria-hidden="true">${escapeHtml(initial)}</div>
            <div style="min-width:0;flex:1;">
              <div class="jp-title-text">${escapeHtml(j.title || 'Untitled Position')}</div>
              <div class="jp-mobile-card__company">${escapeHtml(company)}</div>
            </div>
          </div>
          ${renderStatusPill(j.status)}
        </div>

        <div class="jp-mobile-card__meta">
          <div class="jp-mobile-card__meta-item">
            <span class="jp-mobile-card__meta-label">Employment Type</span>
            <div>${renderTypePill(j.type)}</div>
          </div>
          <div class="jp-mobile-card__meta-item">
            <span class="jp-mobile-card__meta-label">Applicants</span>
            <span class="jp-mobile-card__meta-val">${count.toLocaleString()}</span>
          </div>
          <div class="jp-mobile-card__meta-item">
            <span class="jp-mobile-card__meta-label">Location</span>
            <span class="jp-mobile-card__meta-val" title="${escapeHtml(j.location || 'Unspecified')}">${escapeHtml(j.location || 'Unspecified')}</span>
          </div>
          <div class="jp-mobile-card__meta-item">
            <span class="jp-mobile-card__meta-label">Date Posted</span>
            <span class="jp-mobile-card__meta-val">${escapeHtml(j.posted || 'N/A')}</span>
          </div>
        </div>

        ${skills.length ? `
          <div class="jp-skills-row">
            ${skills.slice(0, 3).map(sk => `<span class="skill-tag">${escapeHtml(sk)}</span>`).join('')}
            ${skills.length > 3 ? `<span class="skill-tag">+${skills.length - 3}</span>` : ''}
          </div>
        ` : ''}

        <div class="jp-mobile-card__actions">
          <button
            type="button"
            class="cp-action-btn cp-action-btn--primary btn-view-job"
            data-id="${escapeHtml(j.id)}"
          >
            ${icon('eye', 13)}
            <span>View Details</span>
          </button>
        </div>
      </div>
    `;
  }

  function resetFilters() {
    state.search = '';
    state.status = '';
    state.type = '';
    state.page = 1;
    searchInput.value = '';
    statusSelect.value = '';
    typeSelect.value = '';
    applyFilters(true);
  }

  function renderTablePage() {
    if (!tableContainer || !tableContainer.isConnected) return;

    const paginated = paginateItems(filtered, state.page, PAGE_SIZE);
    state.page = paginated.currentPage;

    const paginationHost = document.createElement('div');
    if (paginated.totalItems > 0) {
      renderPagination(paginationHost, {
        currentPage: paginated.currentPage,
        totalPages: paginated.totalPages,
        totalItems: paginated.totalItems,
        startIndex: paginated.startIndex,
        endIndex: paginated.endIndex,
        itemLabel: 'jobs',
        onPageChange: (nextPage) => {
          state.page = nextPage;
          renderTablePage();
        },
      });
    }

    const hasActiveFilters = Boolean(state.search || state.status || state.type);
    const emptyState = jobs.length === 0
      ? {
          iconName: 'briefcase',
          title: 'No job postings yet',
          text: 'Partner companies have not published any job listings yet.',
        }
      : {
          iconName: 'search',
          title: 'No matching job postings',
          text: 'Try adjusting your search query or filters.',
          actionLabel: hasActiveFilters ? 'Clear Filters' : '',
          onAction: hasActiveFilters ? resetFilters : null,
        };

    renderDataTable(tableContainer, {
      columns,
      rows: paginated.items,
      rowKey: (j) => j.id,
      errorState: loadError
        ? {
            iconName: 'alert-circle',
            title: 'Failed to load',
            text: 'Could not connect to the server.',
          }
        : null,
      emptyState,
      mobileCardRenderer: renderMobileCard,
      footerEl: paginated.totalItems > 0 ? paginationHost : null,
      ariaLabel: 'Job Postings',
      onRowClick: (row) => openJobDetailModal(row),
    });

    tableContainer.querySelectorAll('.btn-view-job').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const job = jobs.find(x => String(x.id) === String(btn.dataset.id));
        if (job) openJobDetailModal(job, btn);
      });
    });

    renderIcons(tableContainer);
  }

  function applyFilters(resetToFirstPage = false) {
    state.search = searchInput.value;
    state.status = statusSelect.value;
    state.type = typeSelect.value;
    if (resetToFirstPage) state.page = 1;

    const q  = state.search.toLowerCase();
    const st = state.status;
    const ty = state.type;

    filtered = jobs.filter(j => {
      if (q && !(j.title || '').toLowerCase().includes(q) && !(j.company || '').toLowerCase().includes(q)) return false;
      if (st && j.status !== st) return false;
      if (ty && j.type !== ty) return false;
      return true;
    });

    renderTablePage();
  }

  const cached = getCached('/admin/jobs');
  if (cached?.data) {
    jobs = Array.isArray(cached.data) ? cached.data : [];
    renderJobAnalytics(jobs, analytics);
    applyFilters(false);
  } else {
    renderAnalyticsSkeleton(analytics);
    renderDataTable(tableContainer, {
      columns,
      loading: true,
      skeletonRows: PAGE_SIZE,
      mobileCardRenderer: renderMobileCard,
      ariaLabel: 'Job Postings',
    });
  }

  apiGetCached('/admin/jobs', {
    onUpdate: (fresh) => {
      if (!tableContainer || !tableContainer.isConnected) return;
      loadError = false;
      jobs = Array.isArray(fresh) ? fresh : [];
      renderJobAnalytics(jobs, analytics);
      applyFilters(false);
    },
  }).then(res => {
    if (cached || !tableContainer || !tableContainer.isConnected) return;
    if (!res) {
      loadError = true;
      analytics.innerHTML = '';
      renderTablePage();
      return;
    }
    loadError = false;
    jobs = Array.isArray(res) ? res : [];
    renderJobAnalytics(jobs, analytics);
    applyFilters(false);
  }).catch(() => {
    if (!cached && tableContainer && tableContainer.isConnected) {
      loadError = true;
      analytics.innerHTML = '';
      renderTablePage();
    }
  });

  searchInput?.addEventListener('input', () => applyFilters(true));
  statusSelect?.addEventListener('change', () => applyFilters(true));
  typeSelect?.addEventListener('change', () => applyFilters(true));
}
