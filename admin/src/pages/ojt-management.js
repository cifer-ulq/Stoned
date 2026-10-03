/* ── OJT Management Page — Admin Portal ── */
import { apiGet, apiGetCached, getCached, apiPost, apiDelete, storageUrl } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';

const STATUS_COLORS = {
  'On Track':                'success',
  'Delayed':                 'warning',
  'Completed':               'info',
  'At Risk':                 'error',
  'Endorsed':                'info',
  'Accepted':                'success',
  'Endorsement Requested':   'warning',
  'Interested':              'neutral',
};

const COURSES = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Computer Engineering',
  'Bachelor of Science in Information Systems',
  'Bachelor of Science in Business Administration',
  'Bachelor of Science in Accountancy',
  'Bachelor of Secondary Education',
  'Bachelor of Science in Hospitality Management',
  'Bachelor of Science in Criminology',
  'Bachelor of Science in Nursing',
  'Bachelor of Science in Agriculture',
  'Bachelor of Science in Fisheries',
];

export default async function OjtManagementPage(container) {
  container.innerHTML = `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 class="page-header__title">OJT Management</h1>
        <p class="page-header__subtitle">Track and manage on-the-job training deployments</p>
      </div>
      <button class="btn btn--primary" id="btn-register-supervisor" style="gap:6px;">${icon('user-check',15)} Register Supervisor</button>
    </div>
    <div class="stats-grid stats-grid--4 anim-stagger" id="ojt-stats">
      ${Array(4).fill(`<div class="stat-card" style="opacity:.35;min-height:90px;"></div>`).join('')}
    </div>

    <!-- Analytics Section -->
    <div style="margin:var(--space-6) 0 var(--space-4);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
        <h2 style="font-size:var(--text-lg);font-weight:var(--weight-semibold);display:flex;align-items:center;gap:8px;margin:0;">${icon('bar-chart-3',18)} OJT Analytics</h2>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);background:var(--bg-elevated);padding:4px 10px;border-radius:20px;border:1px solid var(--border-subtle);">Real-time data</span>
      </div>
      <!-- Analytics Summary Mini-Stats -->
      <div id="analytics-summary" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:var(--space-4);"></div>
      <!-- Charts Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="stat-card" style="padding:20px;" id="chart-status"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading analytics…</p></div>
        <div class="stat-card" style="padding:20px;" id="chart-histogram"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading…</p></div>
      </div>
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:var(--space-4);margin-top:var(--space-4);">
        <div class="stat-card" style="padding:20px;" id="chart-companies"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading…</p></div>
        <div class="stat-card" style="padding:20px;" id="chart-positions"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading…</p></div>
      </div>
    </div>

    <!-- Supervisors Section -->
    <div style="margin:var(--space-6) 0 var(--space-4);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
        <h2 style="font-size:var(--text-lg);font-weight:var(--weight-semibold);display:flex;align-items:center;gap:8px;margin:0;">${icon('users',18)} Program Coordinators</h2>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">1 coordinator per course</span>
      </div>
      <div class="table-wrapper anim-fade-in-up">
        <table class="table" id="sup-table"><thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Registered</th><th style="width:70px;text-align:right;">Action</th></tr></thead><tbody id="sup-tbody"><tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:24px;">Loading…</td></tr></tbody></table>
      </div>
    </div>

    <!-- Trainees Section -->
    <div style="margin:var(--space-6) 0 var(--space-2);">
      <h2 style="font-size:var(--text-lg);font-weight:var(--weight-semibold);margin-bottom:var(--space-4);display:flex;align-items:center;gap:8px;">${icon('briefcase',18)} Trainees</h2>
    </div>
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="search-box">
          ${icon('search', 15)}
          <input class="search-box__input" id="ojt-search" placeholder="Search trainee or company…" />
        </div>
        <select class="form-select" id="filter-status" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Status</option>
          <option>On Track</option><option>Delayed</option><option>At Risk</option><option>Completed</option>
          <option>Endorsed</option><option>Accepted</option><option>Endorsement Requested</option><option>Interested</option>
        </select>
      </div>
      <div class="toolbar__right">
        <span id="ojt-count" style="font-size:var(--text-sm);color:var(--text-tertiary);"></span>
      </div>
    </div>
    <div class="table-wrapper anim-fade-in-up">
      <table class="table" id="ojt-table">
        <thead><tr><th>Student</th><th>Company</th><th>Hours Progress</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="ojt-tbody"></tbody>
      </table>
    </div>
    <div id="ojt-pagination" style="display:flex;justify-content:center;gap:8px;margin-top:var(--space-5);flex-wrap:wrap;"></div>
  `;

  renderIcons();

  const statsEl = container.querySelector('#ojt-stats');
  const tbody   = container.querySelector('#ojt-tbody');
  const countEl = container.querySelector('#ojt-count');
  const pagEl   = container.querySelector('#ojt-pagination');

  let currentPage   = 1;
  let debounceTimer = null;

  /* ── Stats ── */
  function renderStats(s) {
    const items = [
      { label: 'Total Deployed', value: s.total,     ic: 'briefcase',      color: '#6366F1' },
      { label: 'On Track',       value: s.onTrack,   ic: 'check-circle',   color: '#10B981' },
      { label: 'Delayed',        value: s.delayed,   ic: 'alert-triangle', color: '#F59E0B' },
      { label: 'Completed',      value: s.completed, ic: 'award',          color: '#3B82F6' },
    ];
    statsEl.innerHTML = items.map(st => `
      <div class="stat-card anim-fade-in-up">
        <div class="stat-card__top">
          <div class="stat-card__icon" style="background:${st.color}20;color:${st.color};">${icon(st.ic, 18)}</div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__value">${st.value.toLocaleString()}</div>
          <div class="stat-card__label">${st.label}</div>
        </div>
      </div>
    `).join('');
    renderIcons();
  }

  /* ── Table rows ── */
  function renderRows(data) {
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p class="empty-state__text">No trainees found</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(s => {
      const barColor = s.pct >= 100 ? '#3B82F6' : s.pct >= 40 ? '#10B981' : '#F59E0B';
      const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              ${s.avatar_url
                ? `<img src="${storageUrl(s.avatar_url)}" style="width:32px;height:32px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
                : `<div class="entity-card__avatar" style="width:32px;height:32px;font-size:0.6rem;flex-shrink:0;">${initials}</div>`}
              <div>
                <div style="font-weight:var(--weight-medium);font-size:var(--text-sm);">${s.name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.program}${s.campus ? ' · ' + s.campus : ''}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);">${s.company}</div>
            ${s.posting_title ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.posting_title}</div>` : ''}
            ${s.location ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.location}</div>` : ''}
          </td>
          <td>
            ${s.hours_required > 0 ? `
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="progress-bar" style="flex:1;">
                <div class="progress-bar__fill" style="width:${s.pct}%;background:${barColor};"></div>
              </div>
              <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);width:60px;text-align:right;white-space:nowrap;">${s.hours_done}/${s.hours_required}h</span>
            </div>` : `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.duration || 'Tracking not started'}</span>`}
          </td>
          <td><span class="badge badge--${STATUS_COLORS[s.status] || 'neutral'}">${s.status}</span></td>
          <td>
            <div style="display:flex;gap:4px;">
              <button class="btn btn--ghost btn--sm">${icon('eye', 13)}</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    renderIcons();
  }

  /* ── Pagination ── */
  function renderPagination(meta) {
    pagEl.innerHTML = '';
    if (meta.last_page <= 1) return;
    const total = meta.last_page;
    const cur   = meta.current_page;
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3) pages.push('…');
      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
      if (cur < total - 2) pages.push('…');
      pages.push(total);
    }
    pagEl.innerHTML = [
      `<button class="an-pg-btn an-pg-btn--nav" data-p="${cur - 1}" ${cur === 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)}</button>`,
      ...pages.map(p => p === '…'
        ? `<span style="padding:0 4px;align-self:center;color:var(--text-tertiary);">…</span>`
        : `<button class="an-pg-btn ${p === cur ? 'an-pg-btn--active' : ''}" data-p="${p}">${p}</button>`),
      `<button class="an-pg-btn an-pg-btn--nav" data-p="${cur + 1}" ${cur === total ? 'disabled' : ''}>${icon('chevronRight', 14)}</button>`,
    ].join('');
    renderIcons();
    pagEl.querySelectorAll('.an-pg-btn[data-p]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.p);
        fetchAndRender();
      });
    });
  }

  /* ── Fetch + render ── */
  function applyOjtResponse(res) {
    if (!res || res.message) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h3 class="empty-state__title">Failed to load</h3><p class="empty-state__text">${res?.message || 'Check your connection or login session.'}</p></div></td></tr>`;
      return;
    }

    if (res.stats) renderStats(res.stats);
    countEl.textContent = res.total != null ? `${res.total} trainee${res.total !== 1 ? 's' : ''}` : '';
    renderRows(Array.isArray(res.data) ? res.data : []);
    renderPagination({ current_page: res.current_page, last_page: res.last_page });
  }

  async function fetchAndRender(force = false) {
    const search = container.querySelector('#ojt-search').value.trim();
    const status = container.querySelector('#filter-status').value;
    const params = new URLSearchParams({ per_page: 20, page: currentPage });
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    const url = `/admin/ojt?${params}`;
    const cached = !force ? getCached(url) : null;

    if (cached?.data) {
      applyOjtResponse(cached.data);
    } else {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p class="empty-state__text" style="display:flex;align-items:center;gap:6px;">${icon('refresh-cw', 14)} Loading…</p></div></td></tr>`;
      pagEl.innerHTML = '';
      renderIcons();
    }

    const res = await apiGetCached(url, {
      force,
      onUpdate: (fresh) => applyOjtResponse(fresh),
    });

    if (res && !cached) {
      applyOjtResponse(res);
    }
  }

  fetchAndRender();

  /* ── Filter listeners ── */
  container.querySelector('#ojt-search').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { currentPage = 1; fetchAndRender(); }, 400);
  });
  container.querySelector('#filter-status').addEventListener('change', () => {
    currentPage = 1;
    fetchAndRender();
  });

  /* ── Load Supervisors ── */
  let currentSupervisors = [];
  function renderSupervisors(stb, list) {
    currentSupervisors = list || [];
    if (!currentSupervisors.length) {
      stb.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:24px;">No coordinators registered yet</td></tr>`;
      return;
    }
    stb.innerHTML = currentSupervisors.map(s => {
      const init = s.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      return `<tr>
        <td><div style="display:flex;align-items:center;gap:8px;"><div class="entity-card__avatar" style="width:30px;height:30px;font-size:.55rem;flex-shrink:0;">${init}</div><span style="font-weight:var(--weight-medium);font-size:var(--text-sm);">${s.name}</span></div></td>
        <td style="font-size:var(--text-sm);">${s.email}</td>
        <td><span class="badge badge--info" style="font-size:.65rem;">${s.course || '—'}</span></td>
        <td style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.created_at||''}</td>
        <td style="text-align:right;">
          <button class="btn-icon btn-del-supervisor" data-id="${s.id}" data-name="${s.name}" title="Remove coordinator" style="background:transparent;border:none;cursor:pointer;color:var(--text-tertiary);padding:4px 6px;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;transition:color .15s;">
            ${icon('trash-2', 14)}
          </button>
        </td>
      </tr>`;
    }).join('');
    renderIcons();

    stb.querySelectorAll('.btn-del-supervisor').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.color = '#EF4444'; });
      btn.addEventListener('mouseleave', () => { btn.style.color = 'var(--text-tertiary)'; });
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (!confirm(`Are you sure you want to remove coordinator "${name}"?`)) return;
        btn.disabled = true;
        try {
          const delRes = await apiDelete(`/admin/supervisors/${id}`);
          if (delRes?.success) {
            loadSupervisors(true);
          } else {
            alert(delRes?.message || 'Failed to remove coordinator.');
            btn.disabled = false;
          }
        } catch {
          alert('Network error while attempting to remove coordinator.');
          btn.disabled = false;
        }
      });
    });
  }

  async function loadSupervisors(force = false) {
    const stb = container.querySelector('#sup-tbody');
    if (!stb) return;
    const cached = !force ? getCached('/admin/supervisors') : null;
    if (cached?.data) {
      renderSupervisors(stb, cached.data?.data ?? cached.data ?? []);
    }
    const res = await apiGetCached('/admin/supervisors', {
      force,
      onUpdate: (fresh) => {
        renderSupervisors(stb, fresh?.data ?? fresh ?? []);
      }
    });
    if (res && !cached) {
      renderSupervisors(stb, res?.data ?? res ?? []);
    }
  }
  loadSupervisors();

  /* ── Load Analytics ── */
  function renderAnalyticsData(res) {
    if (!res || res.message) return;
    if (!container.querySelector('#analytics-summary')) return;
    const sm = res.summary || {};
    const sb = res.statusBreakdown || {};

    // Summary mini-stats
    const summaryEl = container.querySelector('#analytics-summary');
    const miniStats = [
      {label:'Deployed',val:sm.totalDeployed||0,ic:'check-circle',color:'#10B981',bg:'rgba(16,185,129,.12)'},
      {label:'Endorsed',val:sm.totalEndorsed||0,ic:'clipboard',color:'#8B5CF6',bg:'rgba(139,92,246,.12)'},
      {label:'Supervisors',val:sm.supervisorCount||0,ic:'user-check',color:'#3B82F6',bg:'rgba(59,130,246,.12)'},
      {label:'Trainee/Supervisor',val:sm.traineeRatio||0,ic:'activity',color:'#F59E0B',bg:'rgba(245,158,11,.12)'},
    ];
    summaryEl.innerHTML = miniStats.map(s => `
      <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:10px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon(s.ic,16)}</div>
        <div><div style="font-size:1.15rem;font-weight:var(--weight-bold);line-height:1.2;">${s.val}</div><div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.label}</div></div>
      </div>`).join('');
    renderIcons();

    // Status Donut with center label
    const statusItems = [
      {label:'On Track',val:sb.onTrack||0,color:'#10B981'},
      {label:'Delayed',val:sb.delayed||0,color:'#F59E0B'},
      {label:'At Risk',val:sb.atRisk||0,color:'#EF4444'},
      {label:'Completed',val:sb.completed||0,color:'#3B82F6'},
      {label:'Pending',val:sb.pending||0,color:'#8B5CF6'},
    ];
    const total = statusItems.reduce((a,b)=>a+b.val,0)||1;
    let offset=0;
    const circumference = 2 * Math.PI * 38;
    const segs = statusItems.filter(s=>s.val>0).map(s=>{
      const pct=s.val/total; const len=pct*circumference; const gap=circumference-len;
      const seg=`<circle cx="60" cy="60" r="38" fill="none" stroke="${s.color}" stroke-width="12" stroke-dasharray="${len.toFixed(1)} ${gap.toFixed(1)}" stroke-dashoffset="-${offset.toFixed(1)}" stroke-linecap="round" style="transition:stroke-dasharray .8s,stroke-dashoffset .8s;"/>`;
      offset+=len; return seg;
    }).join('');
    container.querySelector('#chart-status').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Status Breakdown</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${total} total</span>
      </div>
      <div style="display:flex;align-items:center;gap:28px;">
        <div style="position:relative;flex-shrink:0;">
          <svg viewBox="0 0 120 120" width="140" height="140" style="transform:rotate(-90deg);">
            <circle cx="60" cy="60" r="38" fill="none" stroke="var(--border-subtle)" stroke-width="12" opacity=".3"/>
            ${segs}
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:1.5rem;font-weight:800;line-height:1;">${total}</span>
            <span style="font-size:.6rem;color:var(--text-tertiary);margin-top:2px;">TRAINEES</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex:1;">
          ${statusItems.map(s => {
            const pct = total > 0 ? Math.round(s.val/total*100) : 0;
            return `<div style="display:flex;align-items:center;gap:8px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
              <span style="font-size:var(--text-xs);flex:1;">${s.label}</span>
              <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);min-width:20px;text-align:right;">${s.val}</span>
              <span style="font-size:9px;color:var(--text-tertiary);width:30px;text-align:right;">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    // Hours Histogram
    const hh = res.hoursHistogram||{};
    const hhEntries = Object.entries(hh);
    const maxHh = Math.max(...hhEntries.map(e=>e[1]),1);
    const barGradients = ['linear-gradient(180deg,#EF4444,#DC2626)','linear-gradient(180deg,#F59E0B,#D97706)','linear-gradient(180deg,#3B82F6,#2563EB)','linear-gradient(180deg,#10B981,#059669)'];
    const barLabels = ['Early Stage','In Progress','Almost There','Complete'];
    container.querySelector('#chart-histogram').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Hours Completion</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">by progress range</span>
      </div>
      <div style="position:relative;height:160px;display:flex;align-items:flex-end;gap:16px;padding:0 8px;">
        ${[75,50,25].map(v => `<div style="position:absolute;left:0;right:0;bottom:${v/100*140}px;border-bottom:1px dashed var(--border-subtle);opacity:.3;"></div>`).join('')}
        ${hhEntries.map(([label,val],i) => {
          const h = maxHh > 0 ? Math.max(val/maxHh*140,6) : 6;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:1;">
            <span style="font-size:.75rem;font-weight:700;">${val}</span>
            <div style="width:100%;max-width:52px;background:${barGradients[i]};border-radius:8px 8px 4px 4px;height:${h}px;box-shadow:0 2px 8px ${['rgba(239,68,68,.3)','rgba(245,158,11,.3)','rgba(59,130,246,.3)','rgba(16,185,129,.3)'][i]};transition:height .6s;"></div>
            <div style="text-align:center;"><div style="font-size:9px;font-weight:600;color:var(--text-secondary);">${label}</div><div style="font-size:8px;color:var(--text-tertiary);">${barLabels[i]}</div></div>
          </div>`;
        }).join('')}
      </div>`;

    // Company Distribution
    const cd = res.companyDistribution||{};
    const cdEntries = Object.entries(cd);
    const maxCd = Math.max(...cdEntries.map(e=>e[1]),1);
    const companyColors = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#14B8A6','#F97316','#6B7280'];
    container.querySelector('#chart-companies').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Company Distribution</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${cdEntries.length} partner${cdEntries.length!==1?'s':''}</span>
      </div>
      ${cdEntries.length ? cdEntries.map(([name,val],i) => {
        const pct = Math.round(val/maxCd*100);
        const c = companyColors[i % companyColors.length];
        return `<div style="margin-bottom:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
              <div style="width:6px;height:6px;border-radius:50%;background:${c};flex-shrink:0;"></div>
              <span style="font-weight:var(--weight-medium);">${name}</span>
            </div>
            <span style="font-size:var(--text-xs);font-weight:var(--weight-bold);color:${c};">${val} trainee${val!==1?'s':''}</span>
          </div>
          <div style="height:8px;background:var(--border-subtle);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${c},${c}cc);border-radius:4px;transition:width .6s;"></div>
          </div>
        </div>`;
      }).join('') : '<div style="display:flex;flex-direction:column;align-items:center;padding:30px;color:var(--text-tertiary);"><div style="width:40px;height:40px;border-radius:50%;background:var(--border-subtle);display:flex;align-items:center;justify-content:center;margin-bottom:8px;">' + icon('building-2',18) + '</div><p style="font-size:var(--text-sm);margin:0;">No deployments yet</p></div>'}`;

    // Top Positions
    const tp = res.topPositions||{};
    const tpEntries = Object.entries(tp);
    const medalColors = ['#F59E0B','#94A3B8','#CD7F32'];
    container.querySelector('#chart-positions').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Top OJT Positions</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${tpEntries.length} role${tpEntries.length!==1?'s':''}</span>
      </div>
      ${tpEntries.length ? `<div style="display:flex;flex-direction:column;gap:6px;">
        ${tpEntries.map(([title,cnt],i) => {
          const mc = i < 3 ? medalColors[i] : 'var(--text-tertiary)';
          const bg = i < 3 ? mc + '18' : 'var(--border-subtle)';
          return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:${i===0 ? 'rgba(245,158,11,.06)' : 'transparent'};border:1px solid ${i===0 ? 'rgba(245,158,11,.15)' : 'transparent'};transition:background .2s;">
            <div style="width:24px;height:24px;border-radius:50%;background:${bg};color:${mc};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;">${i<3 ? ['🥇','🥈','🥉'][i] : i+1}</div>
            <span style="flex:1;font-size:var(--text-sm);font-weight:var(--weight-medium);">${title}</span>
            <span style="font-size:var(--text-xs);font-weight:var(--weight-bold);background:var(--border-subtle);padding:2px 8px;border-radius:10px;">${cnt}</span>
          </div>`;
        }).join('')}
      </div>` : '<div style="display:flex;flex-direction:column;align-items:center;padding:30px;color:var(--text-tertiary);"><div style="width:40px;height:40px;border-radius:50%;background:var(--border-subtle);display:flex;align-items:center;justify-content:center;margin-bottom:8px;">' + icon('briefcase',18) + '</div><p style="font-size:var(--text-sm);margin:0;">No positions yet</p></div>'}`;
  }

  async function loadAnalytics(force = false) {
    const cached = !force ? getCached('/admin/ojt-analytics') : null;
    if (cached?.data) {
      renderAnalyticsData(cached.data);
    }
    const res = await apiGetCached('/admin/ojt-analytics', {
      force,
      onUpdate: (fresh) => renderAnalyticsData(fresh),
    });
    if (res && !cached) {
      renderAnalyticsData(res);
    }
  }
  loadAnalytics();

  /* ── Register Supervisor Modal ── */
  container.querySelector('#btn-register-supervisor').addEventListener('click', () => {
    const existing = container.querySelector('.modal-backdrop');
    if (existing) existing.remove();

    const courseCountMap = {};
    currentSupervisors.forEach(s => {
      if (s.course) {
        courseCountMap[s.course] = (courseCountMap[s.course] || 0) + 1;
      }
    });

    const courseOptions = COURSES.map(c => {
      const count = courseCountMap[c] || 0;
      const countLabel = count > 0 ? ` (${count} active coordinator${count > 1 ? 's' : ''})` : '';
      return `<option value="${c}">${c}${countLabel}</option>`;
    }).join('');

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal ac-modal" style="max-width:520px;">

        <!-- Header -->
        <div class="ac-modal__header" style="background:linear-gradient(135deg,var(--color-primary-bg-strong),var(--color-primary-bg));">
          <div class="ac-modal__header-left">
            <div class="ac-modal__icon" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;">
              ${icon('user-check', 20)}
            </div>
            <div>
              <h3 class="ac-modal__title">Register Supervisor</h3>
              <p class="ac-modal__subtitle">Create an OJT coordinator account for a program</p>
            </div>
          </div>
          <button class="modal__close" id="sup-close">${icon('x', 16)}</button>
        </div>

        <!-- Status Banner -->
        <div class="ac-modal__status-banner">
          ${icon('shield', 14)}
          <span>Supervisor will receive a <strong>temporary password</strong> to log in and manage assigned trainees.</span>
        </div>

        <div class="ac-modal__body">
          <form id="sup-form" novalidate>

            <!-- Section 1: Account Info -->
            <div class="ac-section">
              <div class="ac-section__label">
                <span class="ac-section__num">1</span>
                Account Information
              </div>
              <div class="ac-grid ac-grid--3col">
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Full Name <span class="ac-req">*</span></label>
                  <div class="ac-input-wrap" id="wrap-sup-name">
                    <span class="ac-input-icon">${icon('user', 15)}</span>
                    <input class="ac-input" id="sup-name" type="text" placeholder="e.g. Juan Dela Cruz" />
                  </div>
                  <span class="ac-error" id="err-sup-name"></span>
                </div>
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Email Address <span class="ac-req">*</span></label>
                  <div class="ac-input-wrap" id="wrap-sup-email">
                    <span class="ac-input-icon">${icon('mail', 15)}</span>
                    <input class="ac-input" id="sup-email" type="email" placeholder="supervisor@company.com" autocomplete="email" />
                  </div>
                  <span class="ac-error" id="err-sup-email"></span>
                </div>
              </div>
            </div>

            <!-- Section 2: Course -->
            <div class="ac-section ac-section--last">
              <div class="ac-section__label">
                <span class="ac-section__num">2</span>
                Program / Course
              </div>
              <div class="ac-grid">
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Assigned Course <span class="ac-req">*</span></label>
                  <div class="ac-input-wrap" id="wrap-sup-course">
                    <span class="ac-input-icon">${icon('clipboard-check', 15)}</span>
                    <select class="ac-input ac-select" id="sup-course">
                      <option value="">Select course program</option>
                      ${courseOptions}
                    </select>
                  </div>
                  <span class="ac-error" id="err-sup-course"></span>
                </div>
              </div>
            </div>

            <!-- Server Messages -->
            <div id="sup-server-error" class="ac-server-error" style="display:none;"></div>
            <div id="sup-success" style="display:none;margin:0 24px 16px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3);border-radius:var(--radius-md);padding:12px 16px;font-size:var(--text-sm);color:#065F46;"></div>

          </form>
        </div>

        <!-- Footer -->
        <div class="ac-modal__footer">
          <div class="ac-modal__footer-note">
            ${icon('shield', 13)}
            Auto-generated password will be shown after registration
          </div>
          <div class="ac-modal__footer-actions">
            <button class="btn btn--outline btn--sm" id="sup-cancel">Cancel</button>
            <button class="btn btn--primary" id="sup-submit">${icon('user-check', 15)} Register Supervisor</button>
          </div>
        </div>

      </div>
    `;

    container.appendChild(backdrop);
    renderIcons();

    const close = () => backdrop.remove();
    backdrop.querySelector('#sup-close').addEventListener('click', close);
    backdrop.querySelector('#sup-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

    backdrop.querySelector('#sup-submit').addEventListener('click', async () => {
      // Clear errors
      backdrop.querySelectorAll('.ac-error').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
      backdrop.querySelectorAll('.ac-input-wrap--error').forEach(el => el.classList.remove('ac-input-wrap--error'));
      backdrop.querySelector('#sup-server-error').style.display = 'none';
      backdrop.querySelector('#sup-success').style.display = 'none';

      const name = backdrop.querySelector('#sup-name').value.trim();
      const email = backdrop.querySelector('#sup-email').value.trim();
      const course = backdrop.querySelector('#sup-course').value;

      let valid = true;
      const setErr = (id, msg) => {
        const errEl = backdrop.querySelector('#err-' + id);
        if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
        const wrap = backdrop.querySelector('#wrap-' + id);
        if (wrap) wrap.classList.add('ac-input-wrap--error');
        valid = false;
      };

      if (!name) setErr('sup-name', 'Full name is required.');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('sup-email', 'Valid email is required.');
      if (!course) setErr('sup-course', 'Please select a course program.');
      if (!valid) return;

      const btn = backdrop.querySelector('#sup-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-sm"></span> Registering…';

      try {
        const res = await apiPost('/admin/supervisors', { name, email, course });

        if (res?.supervisor) {
          const sucEl = backdrop.querySelector('#sup-success');
          sucEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              ${icon('check-circle', 16)}
              <strong style="color:#047857;">${res.supervisor.name}</strong> registered successfully!
            </div>
            <div style="background:#fff;border:1px solid rgba(16,185,129,.2);border-radius:6px;padding:8px 12px;margin-top:6px;">
              <span style="font-size:var(--text-xs);color:var(--text-tertiary);display:block;margin-bottom:2px;">Temporary Password</span>
              <code style="font-size:var(--text-base);font-weight:700;color:#111;letter-spacing:.5px;">${res.temp_password}</code>
            </div>
            <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin:8px 0 0;">Please save this password — it won't be shown again.</p>
          `;
          sucEl.style.display = 'block';
          btn.style.display = 'none';
          backdrop.querySelector('#sup-cancel').textContent = 'Done';
          loadSupervisors();
        } else {
          const serverErr = backdrop.querySelector('#sup-server-error');
          const msg = res?.message || (res?.errors ? Object.values(res.errors).flat().join(', ') : 'Registration failed.');
          serverErr.textContent = msg;
          serverErr.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = `${icon('user-check', 15)} Register Supervisor`;
          renderIcons();
        }
      } catch {
        const serverErr = backdrop.querySelector('#sup-server-error');
        serverErr.textContent = 'Could not connect to server.';
        serverErr.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `${icon('user-check', 15)} Register Supervisor`;
        renderIcons();
      }
    });
  });
}
