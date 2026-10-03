/* ── Reports Page — Admin Portal (Redesigned) ── */
import { apiFetch } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';

export default async function ReportsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Reports</h1>
      <p class="page-header__subtitle">Generate and download institutional reports</p>
    </div>
    <div class="toolbar">
      <div class="toolbar__left">
        <div class="search-box">${icon('search', 15)}<input class="search-box__input" id="report-search" placeholder="Search reports..." /></div>
        <select class="form-select" id="filter-cat" style="width:auto;padding:7px 32px 7px 10px;"><option value="">All Categories</option><option>Employment</option><option>OJT</option><option>Skills</option><option>Enrollment</option></select>
      </div>
      <div class="toolbar__right">
        <button class="btn btn--primary btn--sm">${icon('plus', 14)} Generate Report</button>
      </div>
    </div>
    <div class="entity-grid anim-stagger" id="reports-grid"></div>
  `;

  renderIcons();

  const reports = [
    { id: '1', title: 'Employment Outcomes Report', category: 'Employment', description: 'Annual graduate employment status and career placement analytics', date: 'Dec 15, 2024', format: 'PDF', status: 'Ready', size: '2.4 MB' },
    { id: '2', title: 'OJT Completion Summary', category: 'OJT', description: 'Semester report on OJT deployment status, hours completed, and company evaluations', date: 'Dec 10, 2024', format: 'PDF', status: 'Ready', size: '1.8 MB' },
    { id: '3', title: 'Skills Gap Analysis', category: 'Skills', description: 'Comprehensive skills-to-job matching analysis with recommendations', date: 'Dec 5, 2024', format: 'XLSX', status: 'Ready', size: '3.1 MB' },
    { id: '4', title: 'Student Enrollment Trends', category: 'Enrollment', description: 'Multi-year enrollment data by program, gender, and region', date: 'Nov 28, 2024', format: 'PDF', status: 'Ready', size: '1.2 MB' },
    { id: '5', title: 'Company Partnership Report', category: 'Employment', description: 'Active MOU/MOA status, company ratings, and partnership effectiveness', date: 'Nov 20, 2024', format: 'PDF', status: 'Generating', size: '—' },
    { id: '6', title: 'Graduate Tracer Study', category: 'Employment', description: 'Longitudinal tracking of graduate career progression and satisfaction', date: 'Nov 15, 2024', format: 'XLSX', status: 'Ready', size: '4.5 MB' },
  ];

  const grid = container.querySelector('#reports-grid');
  const catIcons = { Employment: 'briefcase', OJT: 'clipboard', Skills: 'target', Enrollment: 'users' };
  const catColors = { Employment: '#6366F1', OJT: '#10B981', Skills: '#F59E0B', Enrollment: '#3B82F6' };
  const statusBadge = { Ready: 'success', Generating: 'warning', Failed: 'danger' };

  function render(list) {
    grid.innerHTML = list.length ? list.map(r => `
      <div class="entity-card anim-fade-in-up">
        <div class="entity-card__header">
          <div class="entity-card__avatar" style="background:${catColors[r.category]}12;color:${catColors[r.category]};">${icon(catIcons[r.category] || 'file', 18)}</div>
          <div class="entity-card__info">
            <p class="entity-card__name">${r.title}</p>
            <p class="entity-card__sub">${r.category}</p>
          </div>
          <span class="badge badge--${statusBadge[r.status] || 'neutral'}">${r.status}</span>
        </div>
        <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:4px 0 8px;line-height:1.5;">${r.description}</p>
        <div class="entity-card__meta">
          <span>${icon('calendar', 11)} ${r.date}</span>
          <span>${icon('file', 11)} ${r.format}</span>
          <span>${icon('layers', 11)} ${r.size}</span>
        </div>
        <div class="entity-card__actions">
          <button class="btn btn--ghost btn--sm">${icon('eye', 13)} Preview</button>
          ${r.status === 'Ready'
            ? `<button class="btn btn--primary btn--sm">${icon('download', 13)} Download</button>`
            : `<button class="btn btn--outline btn--sm" disabled>${icon('clock', 13)} Pending</button>`}
        </div>
      </div>
    `).join('') : `<div class="empty-state" style="grid-column:1/-1;"><h3 class="empty-state__title">No reports found</h3><p class="empty-state__text">Try adjusting your filters</p></div>`;
    renderIcons();
  }

  render(reports);

  function applyFilters() {
    const q = container.querySelector('#report-search').value.toLowerCase();
    const cat = container.querySelector('#filter-cat').value;
    const filtered = reports.filter(r => {
      if (q && !r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
      if (cat && r.category !== cat) return false;
      return true;
    });
    render(filtered);
  }

  container.querySelector('#report-search').addEventListener('input', applyFilters);
  container.querySelector('#filter-cat').addEventListener('change', applyFilters);
}
