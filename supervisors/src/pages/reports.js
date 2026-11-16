/* ==========================================================================
   CHMSU HireMe — OJT Analysis & Insights Page
   Supervisor & OJT Coordinator Portal
   Executive Analytical Suite & Official Institutional Reporting Center
   Designed to professional higher-education standards (CHED CMO 104 compliant)
   ========================================================================== */

import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';
import { getState } from '../store.js';
import { mockData } from '../api/mock-data.js';

const PALETTE = ['#005930', '#059669', '#0284C7', '#D97706', '#7C3AED', '#0D9488', '#4F46E5', '#E11D48'];

const PROGRAM_ACRONYMS = {
  'Bachelor of Science in Information Technology': 'BSIT',
  'Bachelor of Science in Computer Science': 'BSCS',
  'Bachelor of Science in Information Systems': 'BSIS',
  'Bachelor of Science in Entertainment and Multimedia Computing': 'BSEMC',
  'Bachelor of Science in Industrial Technology': 'BSIndTech',
  'Bachelor of Science in Hospitality Management': 'BSHM',
  'Bachelor of Science in Tourism Management': 'BSTM',
  'Bachelor of Science in Business Administration': 'BSBA',
  'Bachelor of Science in Accountancy': 'BSA',
  'Bachelor of Secondary Education': 'BSED',
  'Bachelor of Elementary Education': 'BEED',
};

function shortenProgram(str = '') {
  if (!str) return '—';
  return PROGRAM_ACRONYMS[str] || str;
}

function escapeHtml(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Helpers
// ─────────────────────────────────────────────────────────────────────────────

function donutSvg(pct, color = '#059669', size = 110, stroke = 9) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (Math.min(100, Math.max(0, pct)) / 100);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="an-donut-svg" style="transform:rotate(-90deg);display:block;flex-shrink:0">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border-default)" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round"
        style="transition:stroke-dasharray .8s cubic-bezier(.16,1,.3,1)"/>
    </svg>`;
}

function cardHead(ic, title, sub = '', extra = '') {
  return `
    <div class="an-card__head">
      <div class="an-card__head-left">
        <div class="an-card__head-icon">${icon(ic, 18)}</div>
        <div class="an-card__head-titles">
          <span class="an-card__title">${title}</span>
          ${sub ? `<span class="an-card__sub">${sub}</span>` : ''}
        </div>
      </div>
      ${extra ? `<div class="an-card__head-extra">${extra}</div>` : ''}
    </div>`;
}

function emptyState(msg, iconName = 'inbox') {
  return `
    <div class="an-empty">
      <div class="an-empty__icon">${icon(iconName, 26)}</div>
      <p class="an-empty__text">${msg}</p>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Precision CSV Export Suite
// ─────────────────────────────────────────────────────────────────────────────

function downloadBlob(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportMasterCohortCsv(data, supervisorName, supervisorDept) {
  const { trainees = [], kpi = {}, locationStats = {}, hoursBuckets = [], companyDist = {} } = data;
  if (!trainees.length) {
    alert('No trainee cohort records available to export.');
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const timeStr = new Date().toLocaleTimeString('en-US');
  const locTotal = (locationStats.inSite + locationStats.tooFar + locationStats.noGps) || 1;
  const inSitePct = Math.round(((locationStats.inSite || 0) / locTotal) * 100);

  const lines = [];

  // 1. Institutional Metadata Header
  lines.push('# CARLOS HILADO MEMORIAL STATE UNIVERSITY (CHMSU)');
  lines.push('# Office of Student Internship & Supervisory Oversight');
  lines.push('# OFFICIAL OJT COHORT PERFORMANCE & PROGRESS AUDIT');
  lines.push(`# Faculty Supervisor / Coordinator: "${supervisorName.replace(/"/g, '""')}"`);
  lines.push(`# Department / College: "${supervisorDept.replace(/"/g, '""')}"`);
  lines.push(`# Academic Year: 2025-2026 | Term: Second Semester`);
  lines.push(`# Report Generated: ${dateStr} ${timeStr}`);
  lines.push('# Standard Curricular Requirement: 600 Hours (CHED CMO 104, s. 2017)');
  lines.push('#');

  // 2. Executive Metrics Summary Block
  lines.push('# --- COHORT EXECUTIVE KPI SCORECARD ---');
  lines.push(`Total Enrolled Trainees,${trainees.length}`);
  lines.push(`Active in Placement,${kpi.activeTrainees || trainees.length}`);
  lines.push(`Total Hours Rendered,${kpi.totalHoursLogged || 0}`);
  const avgHrs = trainees.length ? (trainees.reduce((s, t) => s + (t.completedHours || 0), 0) / trainees.length).toFixed(1) : 0;
  lines.push(`Average Hours Completed,${avgHrs}`);
  const avgPct = trainees.length ? Math.round(trainees.reduce((s, t) => s + (t.pct || 0), 0) / trainees.length) : 0;
  lines.push(`Average Cohort Completion Rate,${avgPct}%`);
  lines.push(`On-Site Geofence Compliance Rate,${inSitePct}% (${locationStats.inSite || 0} of ${locTotal} logs)`);
  lines.push(`Out-of-Bounds Exceptions Flagged,${locationStats.tooFar || 0}`);
  lines.push(`Pending Endorsement Letters,${kpi.pendingLetters || 0}`);
  lines.push('#');

  // 3. Trainee Cohort Performance Roster Table
  lines.push('# --- COMPREHENSIVE TRAINEE PERFORMANCE ROSTER ---');
  const rosterHeaders = [
    'No.',
    'Student ID',
    'Student Full Name',
    'Email Address',
    'Degree Program',
    'Host Partner Company (HTE)',
    'Assigned Supervisor',
    'Placement Start Date',
    'Target Completion Date',
    'Rendered Hours',
    'Required Hours',
    'Accredited Hours',
    'Remaining Hours',
    'Completion Rate (%)',
    'Cohort Pacing Status',
    'Supervisory Flags & Remarks'
  ];
  lines.push(rosterHeaders.join(','));

  trainees.forEach((t, idx) => {
    const req = t.requiredHours || 600;
    const comp = t.completedHours || 0;
    const acc = t.accreditedHours || 0;
    const rem = Math.max(0, req - comp);
    const pct = t.pct ?? (req > 0 ? Math.round((comp / req) * 100) : 0);
    const pacing = t.status === 'flagged' ? 'Flagged / Requires Audit' : (pct >= 100 ? 'Completed (600h)' : (pct >= 50 ? 'On Track (>=50%)' : 'Behind Pace (<50%)'));
    const remarks = t.status === 'flagged' ? 'Irregular attendance or documentation hold' : (pct >= 100 ? 'Curricular requirement satisfied' : 'Actively rendering prescribed hours');

    const row = [
      idx + 1,
      `"${(t.studentId || `STU-2026-${String(t.id).padStart(4, '0')}`).replace(/"/g, '""')}"`,
      `"${(t.name || '—').replace(/"/g, '""')}"`,
      `"${(t.email || `${(t.name || 'student').toLowerCase().replace(/\s+/g, '.')}@chmsu.edu.ph`).replace(/"/g, '""')}"`,
      `"${(t.course || '—').replace(/"/g, '""')}"`,
      `"${(t.company || '—').replace(/"/g, '""')}"`,
      `"${(t.supervisor || 'Assigned Industry Mentor').replace(/"/g, '""')}"`,
      `"${(t.startDate || 'Feb 02, 2026').replace(/"/g, '""')}"`,
      `"${(t.endDate || 'May 30, 2026').replace(/"/g, '""')}"`,
      comp,
      req,
      acc,
      rem,
      `${pct}%`,
      `"${pacing}"`,
      `"${remarks}"`
    ];
    lines.push(row.join(','));
  });

  lines.push('#');

  // 4. Milestone Completion Brackets Summary
  lines.push('# --- CURRICULUM MILESTONE BRACKETS (600 HOURS STANDARD) ---');
  lines.push('Milestone Bracket,Trainee Count,Percentage of Cohort');
  hoursBuckets.forEach(b => {
    const bPct = trainees.length ? Math.round((b.count / trainees.length) * 100) : 0;
    lines.push(`"${b.label}",${b.count},${bPct}%`);
  });

  lines.push('#');

  // 5. Host Training Establishment (HTE) Partner Summary
  lines.push('# --- HOST TRAINING ESTABLISHMENT (HTE) PARTNER DISTRIBUTION ---');
  lines.push('Host Partner Company,Hosted Trainees,Total Cohort Share');
  Object.entries(companyDist).forEach(([comp, count]) => {
    const cPct = trainees.length ? Math.round((count / trainees.length) * 100) : 0;
    lines.push(`"${comp.replace(/"/g, '""')}",${count},${cPct}%`);
  });

  // UTF-8 BOM (\uFEFF) ensures Excel opens special characters and formatting cleanly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  downloadBlob(csvContent, `CHMSU_OJT_Cohort_Master_Audit_${dateStr}.csv`);
}

function exportAttendanceAuditCsv(data, supervisorName, supervisorDept) {
  const { recentLogs = [] } = data;
  if (!recentLogs.length) {
    alert('No attendance ledger records available to export.');
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const lines = [];

  lines.push('# CARLOS HILADO MEMORIAL STATE UNIVERSITY (CHMSU)');
  lines.push('# Office of Student Internship & Supervisory Oversight');
  lines.push('# ATTENDANCE & GEOFENCE VERIFICATION LEDGER AUDIT');
  lines.push(`# Faculty Supervisor: "${supervisorName.replace(/"/g, '""')}"`);
  lines.push(`# Department / College: "${supervisorDept.replace(/"/g, '""')}"`);
  lines.push(`# Export Date: ${dateStr}`);
  lines.push('# Geofence Standard Radius: <= 100 Meters from registered worksite coordinates');
  lines.push('#');

  const headers = [
    'Log Record ID',
    'Date Logged',
    'Student Trainee Name',
    'Student ID',
    'Time In',
    'Time Out',
    'Rendered Hours',
    'GPS Distance (Meters)',
    'Geofence Validity Status',
    'Logged Task / Accomplishment Description'
  ];
  lines.push(headers.join(','));

  recentLogs.forEach((l, idx) => {
    const distText = l.distanceMeters != null ? `${l.distanceMeters}m` : 'Unrecorded';
    const row = [
      l.id || (idx + 1),
      `"${(l.date || '—').replace(/"/g, '""')}"`,
      `"${(l.student || '—').replace(/"/g, '""')}"`,
      `"${(l.studentId || '—').replace(/"/g, '""')}"`,
      `"${(l.timeIn || '—').replace(/"/g, '""')}"`,
      `"${(l.timeOut || '—').replace(/"/g, '""')}"`,
      l.hours || 0,
      `"${distText}"`,
      `"${(l.validity || 'In Site').replace(/"/g, '""')}"`,
      `"${(l.task || 'Assigned daily internship duties').replace(/"/g, '""')}"`
    ];
    lines.push(row.join(','));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n');
  downloadBlob(csvContent, `CHMSU_OJT_Attendance_Geofence_Audit_${dateStr}.csv`);
}

function exportExecutiveSummaryCsv(data, supervisorName, supervisorDept) {
  const { kpi = {}, trainees = [], locationStats = {}, hoursBuckets = [], companyDist = {} } = data;
  const dateStr = new Date().toISOString().slice(0, 10);
  const lines = [];

  const locTotal = (locationStats.inSite + locationStats.tooFar + locationStats.noGps) || 1;
  const inSitePct = Math.round(((locationStats.inSite || 0) / locTotal) * 100);

  lines.push('# CARLOS HILADO MEMORIAL STATE UNIVERSITY (CHMSU)');
  lines.push('# OJT SUPERVISORY EXECUTIVE ANALYTICS DIGEST');
  lines.push(`# Faculty Supervisor: "${supervisorName.replace(/"/g, '""')}" | College: "${supervisorDept.replace(/"/g, '""')}"`);
  lines.push(`# Export Date: ${dateStr}`);
  lines.push('#');
  lines.push('Category,Metric Indicator,Value,Institutional Remarks');
  lines.push(`Cohort Scope,Total Enrolled Trainees,${trainees.length},Active academic term cohort`);
  lines.push(`Cohort Scope,Active in Placement,${kpi.activeTrainees || trainees.length},100% Industry Deployed`);
  lines.push(`Hours Completion,Total Hours Rendered,${kpi.totalHoursLogged || 0},Cumulative logged hours across cohort`);
  const avgHrs = trainees.length ? (trainees.reduce((s, t) => s + (t.completedHours || 0), 0) / trainees.length).toFixed(1) : 0;
  lines.push(`Hours Completion,Average Hours Completed,${avgHrs},Prescribed target: 600 hours`);
  const avgPct = trainees.length ? Math.round(trainees.reduce((s, t) => s + (t.pct || 0), 0) / trainees.length) : 0;
  lines.push(`Hours Completion,Average Progress Percentage,${avgPct}%,Overall cohort pacing metric`);
  lines.push(`Attendance Verification,On-Site Geofence Compliance,${inSitePct}%,Verified within 100m registered worksite`);
  lines.push(`Attendance Verification,Out-of-Bounds Check-Ins,${locationStats.tooFar || 0},Exceeded distance threshold (flagged)`);
  lines.push(`Supervisory Oversight,Pending Endorsement Letters,${kpi.pendingLetters || 0},Awaiting coordinator sign-off`);
  lines.push(`Supervisory Oversight,Flagged Trainees,${kpi.flaggedCount || 0},Requires remedial interview or doc review`);

  const csvContent = '\uFEFF' + lines.join('\r\n');
  downloadBlob(csvContent, `CHMSU_OJT_Executive_Summary_${dateStr}.csv`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Placeholder
// ─────────────────────────────────────────────────────────────────────────────

function renderSkeleton() {
  const sk = h => `<div class="skeleton skeleton--card" style="height:${h}px;border-radius:14px"></div>`;
  return `
    <div class="an-skeleton-stack">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px">
        ${sk(120)}${sk(120)}${sk(120)}${sk(120)}
      </div>
      <div style="margin-top:20px;display:grid;grid-template-columns:1.55fr 1fr;gap:20px">
        ${sk(340)}${sk(340)}
      </div>
      <div style="margin-top:20px">
        ${sk(260)}
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Entry
// ─────────────────────────────────────────────────────────────────────────────

export default function analyticsPage(container) {
  const supervisorName = getState('user.name') || 'Prof. Maria Garcia';
  const supervisorDept = getState('user.department') || getState('user.company_name') || 'College of Computer Studies';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  container.innerHTML = `
    <div class="an-page fade-in">

      <!-- ── Top Institutional Header ────────────────────────────────────── -->
      <div class="an-header">
        <div class="an-header__left">
          <div class="an-header__icon">${icon('barChart2', 26)}</div>
          <div>
            <div class="an-header__school-tag">
              <span>CARLOS HILADO MEMORIAL STATE UNIVERSITY</span>
              <span class="an-header__dot-sep">·</span>
              <span>${supervisorDept}</span>
            </div>
            <div class="an-header__title-row">
              <h1 class="an-header__title">OJT Analysis &amp; Insights</h1>
              <span class="an-term-badge">
                <span class="an-live-dot"></span>
                AY 2025–2026 · 2nd Sem
              </span>
            </div>
            <p class="an-header__sub">Curricular milestone pacing, attendance geofence verification, and host employer engagement monitoring.</p>
          </div>
        </div>

        <div class="an-header__actions">
          <!-- CSV Export Split Button / Dropdown -->
          <div class="an-dropdown-wrap">
            <button class="an-btn-action" id="an-csv-btn" title="Export cohort performance data to CSV spreadsheet">
              ${icon('download', 15)}
              <span>Export CSV</span>
              ${icon('chevronDown', 13)}
            </button>
            <div class="an-dropdown-menu" id="an-csv-menu">
              <button class="an-dropdown-item" id="an-csv-master">
                <div class="an-dropdown-item__icon">${icon('award', 15)}</div>
                <div class="an-dropdown-item__text">
                  <strong>Cohort Performance Master (.csv)</strong>
                  <span>Comprehensive roster with hours, %, and HTE records</span>
                </div>
              </button>
              <button class="an-dropdown-item" id="an-csv-audit">
                <div class="an-dropdown-item__icon">${icon('clipboardCheck', 15)}</div>
                <div class="an-dropdown-item__text">
                  <strong>Attendance &amp; Geofence Audit (.csv)</strong>
                  <span>Verified check-ins, timestamps, and distance logs</span>
                </div>
              </button>
              <button class="an-dropdown-item" id="an-csv-summary">
                <div class="an-dropdown-item__icon">${icon('fileText', 15)}</div>
                <div class="an-dropdown-item__text">
                  <strong>Executive Summary Digest (.csv)</strong>
                  <span>High-level KPIs, milestone brackets, and metrics</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Print Report Button -->
          <button class="an-btn-action an-btn-action--primary" id="an-print-btn" title="Generate official university report for print or PDF">
            ${icon('printer', 15)}
            <span>Print Official Report</span>
          </button>

          <!-- Refresh Button -->
          <button class="an-btn-refresh" id="an-refresh-btn" title="Refresh metrics from server">
            ${icon('refreshCw', 14)}
          </button>
        </div>
      </div>

      <!-- ── Segmented Navigation Bar ──────────────────────────────────────── -->
      <div class="an-nav-bar">
        <div class="an-segmented" role="tablist">
          <button class="an-seg-btn an-seg-btn--active" data-tab="overview" role="tab" aria-selected="true">
            ${icon('layout', 15)} <span>Executive Overview</span>
          </button>
          <button class="an-seg-btn" data-tab="trainees" role="tab" aria-selected="false">
            ${icon('users', 15)} <span>Trainee Progress Ledger</span>
          </button>
          <button class="an-seg-btn" data-tab="attendance" role="tab" aria-selected="false">
            ${icon('clipboardCheck', 15)} <span>Attendance &amp; Geofence Audit</span>
          </button>
          <button class="an-seg-btn" data-tab="print-preview" role="tab" aria-selected="false">
            ${icon('printer', 15)} <span>Official Report Preview</span>
          </button>
        </div>
      </div>

      <!-- ── Main Content Container ────────────────────────────────────────── -->
      <div id="an-root">${renderSkeleton()}</div>

      <!-- ── Trainee Details Modal Container ───────────────────────────────── -->
      <div id="an-modal-root"></div>
    </div>
  `;

  injectStyles();
  loadAnalytics(container, supervisorName, supervisorDept, todayFormatted);

  // CSV Dropdown interactions
  const csvBtn = container.querySelector('#an-csv-btn');
  const csvMenu = container.querySelector('#an-csv-menu');
  csvBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    csvMenu?.classList.toggle('an-dropdown-menu--open');
  });
  document.addEventListener('click', () => {
    csvMenu?.classList.remove('an-dropdown-menu--open');
  });

  // Top header button listeners
  container.querySelector('#an-refresh-btn')?.addEventListener('click', () => {
    const btn = container.querySelector('#an-refresh-btn');
    if (btn) btn.classList.add('an-rotating');
    loadAnalytics(container, supervisorName, supervisorDept, todayFormatted).finally(() => {
      btn?.classList.remove('an-rotating');
    });
  });

  container.querySelector('#an-print-btn')?.addEventListener('click', () => {
    window.print();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Load & Render Analytics Data
// ─────────────────────────────────────────────────────────────────────────────

async function loadAnalytics(container, supervisorName, supervisorDept, todayFormatted) {
  let data = null;
  try {
    const res = await apiGet('/supervisor/analytics');
    data = res?.data ?? null;
  } catch (err) {
    console.error('[Analytics] Failed to fetch data from API:', err);
  }

  // Graceful fallback to mock data if API is offline
  if (!data) {
    data = mockData['supervisor_analytics'] || mockData['supervisor/analytics'] || null;
  }

  const root = container.querySelector('#an-root');
  if (!root) return;

  if (!data) {
    root.innerHTML = `
      <div class="an-empty an-empty--error">
        <div class="an-empty__icon" style="color:#EF4444">${icon('alertCircle', 36)}</div>
        <p class="an-empty__title">Unable to synchronize cohort analytics</p>
        <p class="an-empty__text">We could not load real-time analytics data. Please check your connection and retry.</p>
        <button class="btn btn-secondary" id="an-retry-btn" style="margin-top:14px">
          ${icon('refreshCw', 15)} Try Again
        </button>
      </div>`;
    root.querySelector('#an-retry-btn')?.addEventListener('click', () => analyticsPage(container));
    return;
  }

  const {
    kpi: k = {}, funnel = {}, trainees = [], hoursBuckets = [],
    courseDist = {}, companyDist = {}, topPerformers = [], flagged = [],
    last14Days = [], locationStats = {}, recentLogs = []
  } = data;

  // Bind CSV download buttons
  container.querySelector('#an-csv-master')?.addEventListener('click', () => {
    exportMasterCohortCsv(data, supervisorName, supervisorDept);
  });
  container.querySelector('#an-csv-audit')?.addEventListener('click', () => {
    exportAttendanceAuditCsv(data, supervisorName, supervisorDept);
  });
  container.querySelector('#an-csv-summary')?.addEventListener('click', () => {
    exportExecutiveSummaryCsv(data, supervisorName, supervisorDept);
  });

  // Calculate high-precision cohort aggregates
  const totalTrainees = trainees.length || k.activeTrainees || 1;
  const totalHoursLogged = Number(k.totalHoursLogged || trainees.reduce((s, t) => s + (t.completedHours || 0), 0));
  const avgHoursCompleted = (totalHoursLogged / totalTrainees).toFixed(1);
  const avgCompletionPct = Math.round((Number(avgHoursCompleted) / 600) * 100);

  const onTrackCount  = trainees.filter(t => t.pct >= 50).length;
  const onTrackPct    = Math.round((onTrackCount / totalTrainees) * 100);
  const behindCount   = trainees.filter(t => t.pct < 50 && t.status !== 'completed').length;
  const completedCount= trainees.filter(t => t.pct >= 100 || t.status === 'completed').length;

  const locTotal  = (locationStats.inSite + locationStats.tooFar + locationStats.noGps) || 1;
  const inSitePct = Math.round(((locationStats.inSite || 0) / locTotal) * 100);
  const tooFarPct = Math.round(((locationStats.tooFar || 0) / locTotal) * 100);
  const noGpsPct  = Math.max(0, 100 - inSitePct - tooFarPct);

  const totalActionRequired = (k.flaggedCount || flagged.length || 0) + (k.pendingLetters || funnel.pending || 0);

  // ── 1. Four Focused Executive KPI Scorecards ────────────────────────────────
  const heroKpis = [
    {
      label: 'Trainees in Scope',
      val: `${totalTrainees} Trainees`,
      sub: `${k.totalEndorsed || totalTrainees} total endorsed to date`,
      trend: `${k.activeTrainees || totalTrainees} actively deployed`,
      icon: 'users',
      color: '#005930',
      badgeClass: 'an-hero-badge--good'
    },
    {
      label: 'Cohort Completion Pacing',
      val: `${avgHoursCompleted} hrs`,
      sub: `${avgCompletionPct}% of standard 600-hour requirement`,
      trend: `${onTrackCount} of ${totalTrainees} on pace (≥50%)`,
      icon: 'clock',
      color: '#0284C7',
      badgeClass: 'an-hero-badge--info'
    },
    {
      label: 'Geofence Verification Rate',
      val: `${inSitePct}% In-Site`,
      sub: `${(locationStats.inSite || 0).toLocaleString()} verified check-ins within 100m`,
      trend: locationStats.tooFar > 0 ? `${locationStats.tooFar} out-of-bounds flagged` : 'Zero location exceptions',
      icon: 'shieldCheck',
      color: '#059669',
      badgeClass: locationStats.tooFar > 0 ? 'an-hero-badge--warn' : 'an-hero-badge--good'
    },
    {
      label: 'Supervisory Action Items',
      val: `${totalActionRequired} Action Items`,
      sub: `${k.pendingLetters || 0} pending letters · ${k.flaggedCount || flagged.length} flagged`,
      trend: totalActionRequired > 0 ? 'Review & audit required' : 'All trainees compliant',
      icon: totalActionRequired > 0 ? 'alertTriangle' : 'checkCircle',
      color: totalActionRequired > 0 ? '#D97706' : '#059669',
      badgeClass: totalActionRequired > 0 ? 'an-hero-badge--urgent' : 'an-hero-badge--good'
    }
  ];

  const heroGridHtml = `
    <div class="an-hero-grid">
      ${heroKpis.map(c => `
        <div class="an-hero-card">
          <div class="an-hero-card__top">
            <span class="an-hero-card__label">${c.label}</span>
            <div class="an-hero-card__icon" style="background:${c.color}15;color:${c.color}">
              ${icon(c.icon, 20)}
            </div>
          </div>
          <div class="an-hero-card__value">${c.val}</div>
          <div class="an-hero-card__footer">
            <span class="an-hero-badge ${c.badgeClass}">${c.trend}</span>
            <span class="an-hero-card__sub">${c.sub}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // ── 2. Natural Academic Narrative Briefing (Replacing AI Clutter) ───────────
  const executiveBriefingHtml = `
    <div class="an-briefing-card">
      <div class="an-briefing-card__header">
        <div class="an-briefing-card__icon">${icon('award', 18)}</div>
        <div class="an-briefing-card__titles">
          <span class="an-briefing-card__title">Executive Summary &amp; Cohort Pacing Assessment</span>
          <span class="an-briefing-card__sub">Institutional compliance audit against CHED Memorandum Order No. 104, Series of 2017</span>
        </div>
      </div>
      <div class="an-briefing-grid">
        <div class="an-briefing-item">
          <div class="an-briefing-item__label">
            <span class="an-briefing-item__dot" style="background:#0284C7"></span>
            <strong>Curricular Pacing:</strong>
          </div>
          <p class="an-briefing-item__text">
            The cohort is currently operating at an average completion velocity of <strong>${avgHoursCompleted} hours (${avgCompletionPct}%)</strong>.
            <strong>${onTrackCount} of ${totalTrainees} students</strong> have satisfied more than 50% of the prescribed 600 hours, keeping the cohort on schedule for standard graduation clearances.
          </p>
        </div>

        <div class="an-briefing-item">
          <div class="an-briefing-item__label">
            <span class="an-briefing-item__dot" style="background:#059669"></span>
            <strong>Worksite Verification:</strong>
          </div>
          <p class="an-briefing-item__text">
            Geofence integrity demonstrates a <strong>${inSitePct}% verification rate</strong> across registered partner company coordinates.
            <strong>${locationStats.tooFar || 0} entries</strong> exceeded the 100-meter threshold and have been highlighted for faculty review.
          </p>
        </div>

        <div class="an-briefing-item">
          <div class="an-briefing-item__label">
            <span class="an-briefing-item__dot" style="background:#D97706"></span>
            <strong>Partner Establishments:</strong>
          </div>
          <p class="an-briefing-item__text">
            Students are hosted across <strong>${Object.keys(companyDist).length} accredited Host Training Establishments (HTEs)</strong>.
            All trainees maintain active Memoranda of Agreement (MOA) and valid faculty endorsements.
          </p>
        </div>
      </div>
    </div>
  `;

  // ── 3. Visual Charts (Velocity & Geofence Donut) ───────────────────────────
  const sparkMax = Math.max(...last14Days.map(d => d.count), 1);
  const totalLogs = last14Days.reduce((s, d) => s + d.count, 0);
  const activeDaysCount = last14Days.filter(d => d.count > 0).length || 1;
  const avgLogs = (totalLogs / activeDaysCount).toFixed(1);

  const attendanceVelocityCard = `
    <div class="an-card">
      ${cardHead('trendingUp', 'Daily Attendance & Log Activity', 'Daily student check-ins and log submissions across the last 14 days', `
        <div class="an-velocity-legend">
          <div class="an-velocity-stat">
            <span class="an-velocity-stat__num">${totalLogs}</span>
            <span class="an-velocity-stat__label">Total Logs</span>
          </div>
          <div class="an-velocity-stat-sep"></div>
          <div class="an-velocity-stat">
            <span class="an-velocity-stat__num">${avgLogs}</span>
            <span class="an-velocity-stat__label">Weekday Avg</span>
          </div>
          <div class="an-velocity-stat-sep"></div>
          <div class="an-velocity-stat">
            <span class="an-velocity-stat__num" style="color:#059669">${k.logsToday || 0}</span>
            <span class="an-velocity-stat__label">Today</span>
          </div>
        </div>
      `)}

      <div class="an-chart-container">
        <div class="an-chart-avg-line" style="bottom:${Math.min(88, Math.max(15, (Number(avgLogs) / sparkMax) * 82))}%" title="Weekday Baseline Average: ${avgLogs} logs/day"></div>

        <div class="an-chart-columns">
          ${last14Days.map((d, idx) => {
            const h = sparkMax > 0 ? Math.max(8, Math.round((d.count / sparkMax) * 88)) : 8;
            const isToday = idx === last14Days.length - 1;
            const isWeekend = d.date.startsWith('Sat') || d.date.startsWith('Sun') || d.count === 0;

            return `
              <div class="an-col-wrap${isWeekend ? ' an-col-wrap--weekend' : ''}${isToday ? ' an-col-wrap--today' : ''}">
                <div class="an-col-track">
                  <div class="an-col-fill" style="height:${h}%;">
                    <div class="an-col-tooltip">
                      <strong>${d.count} logs</strong>
                      <span>${d.hours} hrs rendered</span>
                      <small>${d.date}${isWeekend ? ' (Weekend)' : ''}</small>
                    </div>
                  </div>
                </div>
                <div class="an-col-label">${d.date.replace(/\s+\d{4}/, '')}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="an-chart-footer">
        <span class="an-chart-note">${icon('info', 13)} Lighter bars indicate non-working weekend cycles; active weekday attendance averages ${avgLogs} check-ins/day.</span>
      </div>
    </div>
  `;

  const locCard = `
    <div class="an-card">
      ${cardHead('shieldCheck', 'Worksite Geofence Verification', 'GPS radius verification against registered partner facility coordinates (100m threshold)')}
      <div class="an-loc-content">
        <div class="an-loc-donut-area">
          <div class="an-donut-container">
            ${donutSvg(inSitePct, '#059669', 114, 10)}
            <div class="an-donut-inner">
              <span class="an-donut-pct" style="color:#059669">${inSitePct}%</span>
              <span class="an-donut-sub">On-Site</span>
            </div>
          </div>
        </div>

        <div class="an-loc-breakdown">
          <div class="an-loc-item">
            <div class="an-loc-item__header">
              <span class="an-loc-item__title"><span class="an-status-dot" style="background:#059669"></span> Verified Within Worksite Radius</span>
              <strong>${(locationStats.inSite || 0).toLocaleString()} logs (${inSitePct}%)</strong>
            </div>
            <div class="an-loc-progress">
              <div class="an-loc-progress-bar" style="width:${inSitePct}%;background:#059669"></div>
            </div>
          </div>

          <div class="an-loc-item">
            <div class="an-loc-item__header">
              <span class="an-loc-item__title"><span class="an-status-dot" style="background:#E11D48"></span> Out of Bounds (&gt;100m from site)</span>
              <strong>${(locationStats.tooFar || 0).toLocaleString()} logs (${tooFarPct}%)</strong>
            </div>
            <div class="an-loc-progress">
              <div class="an-loc-progress-bar" style="width:${tooFarPct}%;background:#E11D48"></div>
            </div>
          </div>

          <div class="an-loc-item">
            <div class="an-loc-item__header">
              <span class="an-loc-item__title"><span class="an-status-dot" style="background:var(--text-tertiary)"></span> Unrecorded / Mobile GPS Disabled</span>
              <strong>${(locationStats.noGps || 0).toLocaleString()} logs (${noGpsPct}%)</strong>
            </div>
            <div class="an-loc-progress">
              <div class="an-loc-progress-bar" style="width:${noGpsPct}%;background:var(--text-tertiary)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── 4. Milestone Progress Brackets (600 Hours Standard) ───────────────────
  const maxBucket = Math.max(...hoursBuckets.map(b => b.count), 1);
  const hoursBracketCard = `
    <div class="an-card">
      ${cardHead('clock', '600-Hour Curricular Milestone Distribution', 'Student distribution across standard OJT progression intervals')}
      <div class="an-bracket-stack">
        ${hoursBuckets.map(b => {
          const w = maxBucket > 0 ? Math.round((b.count / maxBucket) * 100) : 0;
          return `
            <div class="an-bracket-row">
              <span class="an-bracket-label">${b.label} Completed</span>
              <div class="an-bracket-track">
                <div class="an-bracket-fill" style="width:${w}%;background:${b.color}"></div>
              </div>
              <div class="an-bracket-badge" style="background:${b.color}15;color:${b.color}">
                <strong>${b.count}</strong> trainees
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // ── 5. Host Partner & Program Representations ─────────────────────────────
  const courseEntries  = Object.entries(courseDist || {});
  const companyEntries = Object.entries(companyDist || {});
  const maxCourse  = courseEntries.length  ? Math.max(...courseEntries.map(e => e[1]), 1)  : 1;
  const maxCompany = companyEntries.length ? Math.max(...companyEntries.map(e => e[1]), 1) : 1;

  function renderDistCard(title, ic, entries, max) {
    return `
      <div class="an-card">
        ${cardHead(ic, title, 'Cohort distribution summary')}
        ${entries.length ? `
          <div class="an-dist-stack">
            ${entries.map(([name, count], i) => {
              const color = PALETTE[i % PALETTE.length];
              const pctVal = Math.round((count / max) * 100);
              return `
                <div class="an-dist-row">
                  <span class="an-dist-label" title="${name}">${shortenProgram(name)}</span>
                  <div class="an-dist-track">
                    <div class="an-dist-fill" style="width:${pctVal}%;background:${color}"></div>
                  </div>
                  <span class="an-dist-badge" style="background:${color}15;color:${color}">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : emptyState('No distribution records available.')}
      </div>
    `;
  }

  // ── 6. Tab 2: Trainee Cohort Performance Ledger (Core Table) ───────────────
  const programOptions = Array.from(new Set(trainees.map(t => t.course).filter(Boolean)));

  const traineeLedgerHtml = `
    <div class="an-card an-card--flush">
      <div class="an-table-toolbar">
        <div class="an-table-toolbar__left">
          <div class="an-search-box">
            ${icon('search', 16)}
            <input type="text" id="an-trainee-search" placeholder="Search trainee by name, student ID, or host company..." />
          </div>
          <select class="an-filter-select" id="an-course-filter">
            <option value="all">All Academic Programs (${trainees.length})</option>
            ${programOptions.map(p => `<option value="${escapeHtml(p)}">${shortenProgram(p)}</option>`).join('')}
          </select>
          <select class="an-filter-select" id="an-status-filter">
            <option value="all">All Statuses</option>
            <option value="completed">Completed (600h)</option>
            <option value="ontrack">On Track (≥50%)</option>
            <option value="behind">Behind Pace (&lt;50%)</option>
            <option value="flagged">Flagged for Audit</option>
          </select>
        </div>
        <div class="an-table-toolbar__right">
          <span class="an-table-count" id="an-table-count">Showing <strong>${trainees.length}</strong> of ${trainees.length} trainees</span>
        </div>
      </div>

      <div class="an-table-wrap">
        <table class="an-table" id="an-trainee-table">
          <thead>
            <tr>
              <th>Student Trainee</th>
              <th>Academic Program</th>
              <th>Host Partner Company (HTE)</th>
              <th>Hours Progress (Target 600h)</th>
              <th>Completion Rate</th>
              <th>Status</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${trainees.map(t => {
              const req = t.requiredHours || 600;
              const comp = t.completedHours || 0;
              const pct = t.pct ?? (req > 0 ? Math.round((comp / req) * 100) : 0);
              const barColor = pct >= 80 ? '#059669' : pct >= 40 ? '#005930' : '#D97706';
              const ini = (t.name || 'Student').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
              const stuId = t.studentId || `STU-2026-${String(t.id).padStart(4, '0')}`;
              const email = t.email || `${(t.name || 'student').toLowerCase().replace(/\s+/g, '.')}@chmsu.edu.ph`;
              const statusCls = t.status === 'flagged' ? 'an-chip--urgent' : (pct >= 100 ? 'an-chip--good' : (pct >= 50 ? 'an-chip--info' : 'an-chip--warn'));
              const statusLabel = t.status === 'flagged' ? 'Flagged' : (pct >= 100 ? 'Completed' : 'Active OJT');

              return `
                <tr class="an-trainee-row"
                    data-name="${escapeHtml((t.name || '').toLowerCase())}"
                    data-id="${escapeHtml(stuId.toLowerCase())}"
                    data-company="${escapeHtml((t.company || '').toLowerCase())}"
                    data-course="${escapeHtml(t.course || '')}"
                    data-pct="${pct}"
                    data-status="${t.status || 'active'}">
                  <td>
                    <div class="an-user-cell">
                      <div class="an-user-avatar"><span>${ini}</span></div>
                      <div class="an-user-info">
                        <span class="an-user-name">${escapeHtml(t.name)}</span>
                        <span class="an-user-id">${escapeHtml(stuId)} · ${escapeHtml(email)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="an-course-badge" title="${escapeHtml(t.course)}">${shortenProgram(t.course)}</span>
                  </td>
                  <td>
                    <div class="an-hte-cell">
                      <strong class="an-hte-company">${escapeHtml(t.company || 'Assigned Host Partner')}</strong>
                      <span class="an-hte-supervisor">${escapeHtml(t.supervisor || 'Assigned Industry Mentor')}</span>
                    </div>
                  </td>
                  <td style="min-width:180px">
                    <div class="an-table-progress-wrap">
                      <div class="an-table-progress-track">
                        <div class="an-table-progress-fill" style="width:${Math.min(100, pct)}%;background:${barColor}"></div>
                      </div>
                      <div class="an-table-progress-meta">
                        <span><strong>${comp}</strong> of ${req} hrs</span>
                        ${t.accreditedHours > 0 ? `<span class="an-accredited-tag">+${t.accreditedHours}h accredited</span>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="an-pct-pill" style="color:${barColor};background:${barColor}15">${pct}%</span>
                  </td>
                  <td>
                    <span class="an-chip ${statusCls}">${statusLabel}</span>
                  </td>
                  <td class="text-right">
                    <button class="an-btn-inspect btn-inspect-trainee" data-id="${t.id}" title="Inspect full logs & performance details">
                      ${icon('eye', 14)} <span>Details</span>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // ── 7. Tab 3: Attendance & Geofence Ledger Table ───────────────────────────
  const attendanceAuditHtml = `
    <div class="an-card an-card--flush">
      ${cardHead('clipboardCheck', 'Verified Attendance & Geofence Check-In Audit', 'Real-time timestamped student check-ins and GPS verification coordinates', `
        <div class="an-table-filter-group">
          <button class="an-table-filter an-table-filter--active" data-filter="all">All Check-Ins (${recentLogs.length})</button>
          <button class="an-table-filter" data-filter="insite">Verified In-Site</button>
          <button class="an-table-filter" data-filter="toofar">Out of Bounds</button>
        </div>
      `)}
      ${recentLogs && recentLogs.length ? `
        <div class="an-table-wrap">
          <table class="an-table" id="an-logs-table">
            <thead>
              <tr>
                <th>Student Trainee</th>
                <th>Log Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Rendered Hours</th>
                <th>GPS Geofence Verification</th>
                <th>Task / Duty Output</th>
              </tr>
            </thead>
            <tbody>
              ${recentLogs.map(l => {
                const isInSite = l.validity === 'In Site' || l.validity === 'valid';
                const isTooFar = l.validity === 'Too Far' || l.validity === 'not_valid';
                const statusType = isInSite ? 'insite' : (isTooFar ? 'toofar' : 'nogps');

                const pillHtml = isInSite
                  ? `<span class="an-status-chip an-status-chip--good">${icon('checkCircle', 12)} In-Site (${l.distanceMeters != null ? `${l.distanceMeters}m` : '≤100m'})</span>`
                  : (isTooFar
                    ? `<span class="an-status-chip an-status-chip--warn">${icon('alertTriangle', 12)} Out of Bounds (${l.distanceMeters}m)</span>`
                    : `<span class="an-status-chip an-status-chip--neutral">${icon('helpCircle', 12)} Unrecorded GPS</span>`);

                const ini = (l.student || 'Student').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

                return `
                  <tr data-status="${statusType}">
                    <td>
                      <div class="an-user-cell">
                        <div class="an-user-avatar"><span>${ini}</span></div>
                        <div class="an-user-info">
                          <span class="an-user-name">${escapeHtml(l.student)}</span>
                          <span class="an-user-id">${escapeHtml(l.studentId || 'STU-2026')}</span>
                        </div>
                      </div>
                    </td>
                    <td class="an-cell-muted">${escapeHtml(l.date)}</td>
                    <td><span class="an-time-tag">${escapeHtml(l.timeIn)}</span></td>
                    <td>${l.timeOut !== '—' ? `<span class="an-time-tag">${escapeHtml(l.timeOut)}</span>` : '<span class="an-cell-muted">—</span>'}</td>
                    <td><strong>${l.hours > 0 ? `${l.hours} hrs` : '—'}</strong></td>
                    <td>${pillHtml}</td>
                    <td><span class="an-task-desc" title="${escapeHtml(l.task || '')}">${escapeHtml(l.task || 'Daily internship tasks')}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : emptyState('No verified attendance logs recorded yet.')}
    </div>
  `;

  // ── 8. Tab 4: Official Institutional Document Print Preview ───────────────
  const printPreviewHtml = `
    <div class="an-card">
      <div class="an-print-preview-toolbar">
        <div>
          <span class="an-print-preview-title">${icon('printer', 16)} Official Institutional Document Preview</span>
          <p class="an-print-preview-sub">This matches the exact layout produced when printing or exporting to PDF.</p>
        </div>
        <button class="an-btn-action an-btn-action--primary" id="an-preview-print-btn">
          ${icon('printer', 15)} Print Document / Save PDF
        </button>
      </div>

      <div class="an-official-sheet">
        <!-- University Letterhead -->
        <div class="an-sheet-header">
          <div class="an-sheet-republic">Republic of the Philippines</div>
          <div class="an-sheet-univ">CARLOS HILADO MEMORIAL STATE UNIVERSITY</div>
          <div class="an-sheet-office">OFFICE OF STUDENT INTERNSHIP &amp; ON-THE-JOB TRAINING PROGRAM</div>
          <div class="an-sheet-address">Mabini Street, Talisay City, Negros Occidental 6115 · Tel: (034) 712-0005</div>
          <div class="an-sheet-divider"></div>
          <div class="an-sheet-doc-title">OFFICIAL OJT COHORT PERFORMANCE &amp; SUPERVISORY AUDIT REPORT</div>
          <div class="an-sheet-term">Academic Year 2025–2026 · Second Semester</div>
        </div>

        <!-- Administrative Meta Grid -->
        <div class="an-sheet-meta-grid">
          <div class="an-sheet-meta-col">
            <div><strong>Faculty Supervisor:</strong> ${supervisorName}</div>
            <div><strong>Academic Department:</strong> ${supervisorDept}</div>
            <div><strong>Curricular Hour Standard:</strong> 600 Hours (CHED CMO 104)</div>
          </div>
          <div class="an-sheet-meta-col">
            <div><strong>Report Generation Date:</strong> ${todayFormatted}</div>
            <div><strong>Total Enrolled Cohort:</strong> ${trainees.length} Student Trainees</div>
            <div><strong>Verification Framework:</strong> HireMe OJT Supervisory Suite 2.0</div>
          </div>
        </div>

        <!-- Section 1: Executive Scorecard -->
        <div class="an-sheet-sec-title">SECTION I: EXECUTIVE PERFORMANCE SCORECARD</div>
        <table class="an-sheet-table">
          <thead>
            <tr>
              <th>Metric Indicator</th>
              <th>Cohort Value</th>
              <th>Benchmark Target</th>
              <th>Compliance Evaluation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Enrolled Cohort</td>
              <td><strong>${totalTrainees} Trainees</strong></td>
              <td>100% Deployed</td>
              <td>Fully Deployed Across Accredited HTEs</td>
            </tr>
            <tr>
              <td>Cohort Completion Pacing</td>
              <td><strong>${avgHoursCompleted} Average Hours (${avgCompletionPct}%)</strong></td>
              <td>600.0 Hours Standard</td>
              <td>${onTrackCount} of ${totalTrainees} on pace (${onTrackPct}% on schedule)</td>
            </tr>
            <tr>
              <td>Geofence Verification Rate</td>
              <td><strong>${inSitePct}% In-Site Check-Ins</strong></td>
              <td>≥90.0% Site Radius</td>
              <td>${locationStats.tooFar || 0} location exceptions flagged for audit</td>
            </tr>
            <tr>
              <td>Action &amp; Documentation Items</td>
              <td><strong>${totalActionRequired} Items Requiring Review</strong></td>
              <td>0 Critical Holds</td>
              <td>${k.pendingLetters || 0} pending letters · ${k.flaggedCount || 0} flagged</td>
            </tr>
          </tbody>
        </table>

        <!-- Section 2: Milestone Brackets -->
        <div class="an-sheet-sec-title">SECTION II: COHORT MILESTONE COMPLETION DISTRIBUTION</div>
        <table class="an-sheet-table">
          <thead>
            <tr>
              <th>Milestone Bracket</th>
              <th>Hours Equivalent</th>
              <th>Student Trainee Count</th>
              <th>Cohort Proportion (%)</th>
            </tr>
          </thead>
          <tbody>
            ${hoursBuckets.map(b => {
              const bp = trainees.length ? Math.round((b.count / trainees.length) * 100) : 0;
              return `
                <tr>
                  <td><strong>${b.label} Completed</strong></td>
                  <td>${b.label === '0–25%' ? '0–150 Hours' : (b.label === '26–50%' ? '151–300 Hours' : (b.label === '51–75%' ? '301–450 Hours' : (b.label === '76–99%' ? '451–599 Hours' : '600+ Hours')))}</td>
                  <td>${b.count} Trainees</td>
                  <td>${bp}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Section 3: Trainee Roster -->
        <div class="an-sheet-sec-title">SECTION III: OFFICIAL TRAINEE PERFORMANCE &amp; PROGRESS ROSTER</div>
        <table class="an-sheet-table an-sheet-table--roster">
          <thead>
            <tr>
              <th>No.</th>
              <th>Student ID</th>
              <th>Student Full Name</th>
              <th>Program</th>
              <th>Host Partner Company (HTE)</th>
              <th>Hours Rendered</th>
              <th>Target</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${trainees.map((t, i) => {
              const req = t.requiredHours || 600;
              const comp = t.completedHours || 0;
              const pct = t.pct ?? (req > 0 ? Math.round((comp / req) * 100) : 0);
              const stuId = t.studentId || `STU-2026-${String(t.id).padStart(4, '0')}`;
              const statusTxt = t.status === 'flagged' ? 'FLAGGED' : (pct >= 100 ? 'COMPLETED' : 'ACTIVE');

              return `
                <tr>
                  <td>${i + 1}</td>
                  <td>${stuId}</td>
                  <td><strong>${escapeHtml(t.name)}</strong></td>
                  <td>${shortenProgram(t.course)}</td>
                  <td>${escapeHtml(t.company || '—')}</td>
                  <td>${comp} hrs</td>
                  <td>${req} hrs</td>
                  <td><strong>${pct}%</strong></td>
                  <td>${statusTxt}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Section 4: Certification & University Signatures -->
        <div class="an-sheet-cert-box">
          <p>
            <strong>INSTITUTIONAL CERTIFICATION:</strong> I hereby certify that the student internship attendance records, curricular milestone progression,
            and worksite geofence compliance data compiled in this official report have been verified in accordance with University Internship Guidelines
            and CHED Memorandum Order No. 104, Series of 2017.
          </p>

          <div class="an-sheet-sigs">
            <div class="an-sheet-sig-block">
              <div class="an-sheet-sig-line"></div>
              <div class="an-sheet-sig-name">${supervisorName.toUpperCase()}</div>
              <div class="an-sheet-sig-title">Faculty OJT Supervisor / Coordinator</div>
              <div class="an-sheet-sig-date">Date Signed: ________________________</div>
            </div>

            <div class="an-sheet-sig-block">
              <div class="an-sheet-sig-line"></div>
              <div class="an-sheet-sig-name">DR. EDUARDO G. MARTINEZ</div>
              <div class="an-sheet-sig-title">Dean, College of Computer Studies</div>
              <div class="an-sheet-sig-date">Date Signed: ________________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── Assemble Final View Layout ─────────────────────────────────────────────
  root.innerHTML = `
    <!-- Top Hero KPIs (Permanent Across Views) -->
    ${heroGridHtml}

    <!-- Tab Pane 1: Executive Overview -->
    <div class="an-tab-pane an-tab-pane--active" id="pane-overview">
      ${executiveBriefingHtml}

      <div class="an-layout-row an-layout-row--velocity">
        ${attendanceVelocityCard}
        ${locCard}
      </div>

      <div class="an-layout-row an-layout-row--3col">
        ${hoursBracketCard}
        ${renderDistCard('Academic Degree Programs', 'bookOpen', courseEntries, maxCourse)}
        ${renderDistCard('Host Partner Companies (HTE)', 'building', companyEntries, maxCompany)}
      </div>
    </div>

    <!-- Tab Pane 2: Trainee Progress Ledger -->
    <div class="an-tab-pane" id="pane-trainees" style="display:none">
      ${traineeLedgerHtml}
    </div>

    <!-- Tab Pane 3: Attendance & Geofence Ledger -->
    <div class="an-tab-pane" id="pane-attendance" style="display:none">
      ${attendanceAuditHtml}
    </div>

    <!-- Tab Pane 4: Official Report Preview -->
    <div class="an-tab-pane" id="pane-print-preview" style="display:none">
      ${printPreviewHtml}
    </div>
  `;

  // Bind Segmented Tab Navigation
  const segBtns = container.querySelectorAll('.an-seg-btn');
  const panes = {
    overview: container.querySelector('#pane-overview'),
    trainees: container.querySelector('#pane-trainees'),
    attendance: container.querySelector('#pane-attendance'),
    'print-preview': container.querySelector('#pane-print-preview'),
  };

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segBtns.forEach(b => {
        b.classList.remove('an-seg-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('an-seg-btn--active');
      btn.setAttribute('aria-selected', 'true');

      const targetTab = btn.dataset.tab;
      Object.entries(panes).forEach(([key, pane]) => {
        if (!pane) return;
        if (key === targetTab) {
          pane.style.display = 'flex';
          pane.classList.add('an-fade-enter');
          setTimeout(() => pane.classList.remove('an-fade-enter'), 250);
        } else {
          pane.style.display = 'none';
        }
      });
    });
  });

  // Bind Print from Preview tab
  container.querySelector('#an-preview-print-btn')?.addEventListener('click', () => {
    window.print();
  });

  // Table filtering logic for Trainee Ledger (Search, Course, Status)
  const searchInput  = container.querySelector('#an-trainee-search');
  const courseFilter = container.querySelector('#an-course-filter');
  const statusFilter = container.querySelector('#an-status-filter');
  const traineeRows  = container.querySelectorAll('.an-trainee-row');
  const countLabel   = container.querySelector('#an-table-count');

  function filterTrainees() {
    const q = (searchInput?.value || '').trim().toLowerCase();
    const course = courseFilter?.value || 'all';
    const status = statusFilter?.value || 'all';

    let visible = 0;
    traineeRows.forEach(row => {
      const name = row.dataset.name || '';
      const stuId = row.dataset.id || '';
      const company = row.dataset.company || '';
      const cCourse = row.dataset.course || '';
      const pct = Number(row.dataset.pct || 0);
      const cStatus = row.dataset.status || 'active';

      // Match search
      const matchesSearch = !q || name.includes(q) || stuId.includes(q) || company.includes(q);

      // Match course
      const matchesCourse = course === 'all' || cCourse === course;

      // Match status
      let matchesStatus = true;
      if (status === 'completed') matchesStatus = pct >= 100 || cStatus === 'completed';
      else if (status === 'ontrack') matchesStatus = pct >= 50 && pct < 100 && cStatus !== 'flagged';
      else if (status === 'behind') matchesStatus = pct < 50 && cStatus !== 'flagged';
      else if (status === 'flagged') matchesStatus = cStatus === 'flagged';

      const show = matchesSearch && matchesCourse && matchesStatus;
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countLabel) {
      countLabel.innerHTML = `Showing <strong>${visible}</strong> of ${trainees.length} trainees`;
    }
  }

  searchInput?.addEventListener('input', filterTrainees);
  courseFilter?.addEventListener('change', filterTrainees);
  statusFilter?.addEventListener('change', filterTrainees);

  // Table status filter for Attendance Ledger
  const logFilterBtns = container.querySelectorAll('.an-table-filter');
  const logRows       = container.querySelectorAll('#an-logs-table tbody tr');
  logFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      logFilterBtns.forEach(b => b.classList.remove('an-table-filter--active'));
      btn.classList.add('an-table-filter--active');
      const filter = btn.dataset.filter;

      logRows.forEach(row => {
        if (filter === 'all') {
          row.style.display = '';
        } else {
          row.style.display = row.dataset.status === filter ? '' : 'none';
        }
      });
    });
  });

  // Inspect Trainee Details Modal
  const modalRoot = container.querySelector('#an-modal-root');
  container.querySelectorAll('.btn-inspect-trainee').forEach(btn => {
    btn.addEventListener('click', () => {
      const tid = Number(btn.dataset.id);
      const trainee = trainees.find(t => t.id === tid) || null;
      if (!trainee) return;
      openTraineeModal(trainee, recentLogs.filter(l => l.student === trainee.name), modalRoot);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Trainee Details Modal
// ─────────────────────────────────────────────────────────────────────────────

function openTraineeModal(t, logs, container) {
  if (!container) return;
  const req = t.requiredHours || 600;
  const comp = t.completedHours || 0;
  const acc = t.accreditedHours || 0;
  const rem = Math.max(0, req - comp);
  const pct = t.pct ?? (req > 0 ? Math.round((comp / req) * 100) : 0);
  const ini = (t.name || 'Student').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const stuId = t.studentId || `STU-2026-${String(t.id).padStart(4, '0')}`;

  container.innerHTML = `
    <div class="an-modal-backdrop" id="an-modal-backdrop">
      <div class="an-modal fade-in">
        <div class="an-modal__head">
          <div class="an-modal__head-left">
            <div class="an-modal__avatar"><span>${ini}</span></div>
            <div>
              <h3 class="an-modal__title">${escapeHtml(t.name)}</h3>
              <p class="an-modal__sub">${escapeHtml(stuId)} · ${escapeHtml(t.course)}</p>
            </div>
          </div>
          <button class="an-modal__close" id="an-modal-close">${icon('x', 18)}</button>
        </div>

        <div class="an-modal__body">
          <!-- Placement Host Summary -->
          <div class="an-modal-sec">
            <div class="an-modal-info-grid">
              <div>
                <span class="an-modal-lbl">Host Partner Company (HTE)</span>
                <strong>${escapeHtml(t.company || '—')}</strong>
              </div>
              <div>
                <span class="an-modal-lbl">Company Supervisor</span>
                <strong>${escapeHtml(t.supervisor || 'Assigned Mentor')}</strong>
              </div>
              <div>
                <span class="an-modal-lbl">Placement Period</span>
                <span>${escapeHtml(t.startDate || 'Feb 02, 2026')} – ${escapeHtml(t.endDate || 'May 30, 2026')}</span>
              </div>
              <div>
                <span class="an-modal-lbl">Status</span>
                <span class="an-chip ${t.status === 'flagged' ? 'an-chip--urgent' : 'an-chip--good'}">${t.status === 'flagged' ? 'Flagged for Review' : 'Active OJT'}</span>
              </div>
            </div>
          </div>

          <!-- Hours Pacing Metric Cards -->
          <div class="an-modal-kpis">
            <div class="an-modal-kpi">
              <span class="an-modal-kpi__lbl">Rendered</span>
              <strong class="an-modal-kpi__val" style="color:#005930">${comp} hrs</strong>
            </div>
            <div class="an-modal-kpi">
              <span class="an-modal-kpi__lbl">Required Standard</span>
              <strong class="an-modal-kpi__val">${req} hrs</strong>
            </div>
            <div class="an-modal-kpi">
              <span class="an-modal-kpi__lbl">Accredited Hours</span>
              <strong class="an-modal-kpi__val" style="color:#0284C7">${acc} hrs</strong>
            </div>
            <div class="an-modal-kpi">
              <span class="an-modal-kpi__lbl">Remaining</span>
              <strong class="an-modal-kpi__val" style="color:#D97706">${rem} hrs</strong>
            </div>
          </div>

          <!-- Overall Progress Bar -->
          <div class="an-modal-progress">
            <div class="an-modal-progress__top">
              <span>Overall Curricular Progress</span>
              <strong>${pct}% Completed</strong>
            </div>
            <div class="an-modal-progress__track">
              <div class="an-modal-progress__fill" style="width:${pct}%;background:${pct >= 80 ? '#059669' : (pct >= 50 ? '#005930' : '#D97706')}"></div>
            </div>
          </div>

          <!-- Trainee Logs History -->
          <div class="an-modal-logs-title">${icon('clipboardCheck', 15)} Recent Verified Time Records</div>
          ${logs.length ? `
            <div class="an-modal-logs-table-wrap">
              <table class="an-modal-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Hours</th>
                    <th>GPS Geofence</th>
                    <th>Accomplishment</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(l => `
                    <tr>
                      <td>${escapeHtml(l.date)}</td>
                      <td>${escapeHtml(l.timeIn)}</td>
                      <td>${escapeHtml(l.timeOut)}</td>
                      <td><strong>${l.hours} hrs</strong></td>
                      <td>
                        <span class="an-status-chip ${l.validity === 'In Site' ? 'an-status-chip--good' : 'an-status-chip--warn'}">
                          ${l.validity} (${l.distanceMeters != null ? `${l.distanceMeters}m` : '≤100m'})
                        </span>
                      </td>
                      <td><small>${escapeHtml(l.task || 'Daily tasks')}</small></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<p class="an-empty-sm">No individual time records found for this student.</p>'}
        </div>

        <div class="an-modal__foot">
          <button class="btn btn-secondary" id="an-modal-dismiss">Close</button>
          <a href="#/trainees" class="btn btn-primary" id="an-modal-dtr-link">
            ${icon('users', 14)} Open Full Trainee Record
          </a>
        </div>
      </div>
    </div>
  `;

  function closeModal() {
    container.innerHTML = '';
  }

  container.querySelector('#an-modal-close')?.addEventListener('click', closeModal);
  container.querySelector('#an-modal-dismiss')?.addEventListener('click', closeModal);
  container.querySelector('#an-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'an-modal-backdrop') closeModal();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoped Professional Stylesheet (CHMSU Palette & Institutional Print Engine)
// ─────────────────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById('an-styles')) return;
  const s = document.createElement('style');
  s.id = 'an-styles';
  s.textContent = `
  /* ── Page Layout ── */
  .an-page {
    display: flex;
    flex-direction: column;
    gap: 22px;
    padding-bottom: var(--space-12);
  }

  /* ── Header ── */
  .an-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
    padding: var(--space-2) 0 0;
  }
  .an-header__left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .an-header__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-xl);
    background: #00593015;
    color: #005930;
    border: 1px solid #00593025;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-header__school-tag {
    font-size: 0.72rem;
    font-weight: 700;
    color: #005930;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
  }
  .an-header__dot-sep {
    color: var(--text-tertiary);
  }
  .an-header__title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 2px;
  }
  .an-header__title {
    font-size: 1.55rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }
  .an-header__sub {
    font-size: 0.84rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
  .an-term-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.74rem;
    font-weight: 600;
    color: #059669;
    background: #05966914;
    border: 1px solid #05966930;
    border-radius: var(--radius-full);
    padding: 3px 10px;
    white-space: nowrap;
  }
  .an-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #059669;
    animation: an-pulse 2s infinite ease-in-out;
  }
  @keyframes an-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.85); }
  }

  /* ── Header Actions ── */
  .an-header__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }
  .an-btn-action {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-btn-action:hover {
    background: var(--bg-secondary);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }
  .an-btn-action--primary {
    background: #005930;
    color: #ffffff;
    border-color: #005930;
  }
  .an-btn-action--primary:hover {
    background: #004525;
    border-color: #004525;
    color: #ffffff;
  }
  .an-btn-refresh {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: var(--bg-elevated);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-btn-refresh:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border-strong);
  }
  .an-rotating {
    animation: an-spin 0.8s linear infinite;
  }
  @keyframes an-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── CSV Dropdown ── */
  .an-dropdown-wrap {
    position: relative;
  }
  .an-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    width: 290px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08);
    display: none;
    flex-direction: column;
    padding: 6px;
    z-index: 100;
  }
  .an-dropdown-menu--open {
    display: flex;
    animation: an-fade-in 0.18s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  .an-dropdown-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 12px;
    border: none;
    background: transparent;
    text-align: left;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--duration-fast);
    width: 100%;
  }
  .an-dropdown-item:hover {
    background: var(--bg-secondary);
  }
  .an-dropdown-item__icon {
    color: #005930;
    margin-top: 2px;
    flex-shrink: 0;
  }
  .an-dropdown-item__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .an-dropdown-item__text strong {
    font-size: 0.8rem;
    color: var(--text-primary);
  }
  .an-dropdown-item__text span {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    line-height: 1.25;
  }

  /* ── Segmented Navigation ── */
  .an-nav-bar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-default);
    padding-bottom: 12px;
    margin-top: 2px;
  }
  .an-segmented {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-secondary);
    padding: 4px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
  }
  .an-seg-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    border: none;
    background: transparent;
    border-radius: calc(var(--radius-lg) - 3px);
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--duration-fast);
    white-space: nowrap;
  }
  .an-seg-btn svg { opacity: 0.7; }
  .an-seg-btn:hover { color: var(--text-primary); }
  .an-seg-btn--active {
    background: var(--bg-elevated);
    color: #005930;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .an-seg-btn--active svg { opacity: 1; color: #005930; }

  /* ── Content Root & Panes ── */
  #an-root {
    display: flex;
    flex-direction: column;
    gap: 22px;
    width: 100%;
  }
  .an-tab-pane {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .an-fade-enter {
    animation: an-fade-in 0.22s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @keyframes an-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── 4-Column Hero KPI Grid ── */
  .an-hero-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
  .an-hero-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: transform var(--duration-fast), box-shadow var(--duration-fast), border-color var(--duration-fast);
  }
  .an-hero-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    border-color: var(--border-strong);
  }
  .an-hero-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: 8px;
  }
  .an-hero-card__label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .an-hero-card__icon {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-hero-card__value {
    font-size: 1.85rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--text-primary);
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .an-hero-card__footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .an-hero-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.74rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    width: fit-content;
  }
  .an-hero-badge--good   { background: #05966914; color: #059669; }
  .an-hero-badge--info   { background: #0284C714; color: #0284C7; }
  .an-hero-badge--warn   { background: #D9770614; color: #D97706; }
  .an-hero-badge--urgent { background: #EF444414; color: #EF4444; }
  .an-hero-card__sub {
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  /* ── Executive Briefing Card ── */
  .an-briefing-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-left: 4px solid #005930;
    border-radius: var(--radius-xl);
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  .an-briefing-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .an-briefing-card__icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: #00593014;
    color: #005930;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-briefing-card__titles {
    display: flex;
    flex-direction: column;
  }
  .an-briefing-card__title {
    font-size: 0.96rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-briefing-card__sub {
    font-size: 0.76rem;
    color: var(--text-tertiary);
  }
  .an-briefing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    padding-top: 4px;
    border-top: 1px solid var(--border-default);
  }
  .an-briefing-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .an-briefing-item__label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--text-primary);
  }
  .an-briefing-item__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .an-briefing-item__text {
    font-size: 0.78rem;
    color: var(--text-secondary);
    line-height: 1.45;
    margin: 0;
  }
  .an-briefing-item__text strong {
    color: var(--text-primary);
  }

  /* ── Layout Rows ── */
  .an-layout-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 20px;
  }
  .an-layout-row--velocity {
    grid-template-columns: 1.55fr 1fr;
    gap: 20px;
  }
  .an-layout-row--3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  /* ── Standard Card Shell ── */
  .an-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 22px 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .an-card--flush {
    padding: 0;
    overflow: hidden;
  }
  .an-card--flush .an-card__head {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border-default);
  }
  .an-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .an-card__head-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }
  .an-card__head-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: #00593014;
    color: #005930;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-card__head-titles {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .an-card__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-card__sub {
    font-size: 0.76rem;
    color: var(--text-tertiary);
    line-height: 1.3;
  }
  .an-card__head-extra {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  /* ── Attendance Velocity Chart ── */
  .an-velocity-legend {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .an-velocity-stat {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .an-velocity-stat__num {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-velocity-stat__label {
    font-size: 0.72rem;
    color: var(--text-tertiary);
  }
  .an-velocity-stat-sep {
    width: 1px;
    height: 14px;
    background: var(--border-default);
  }
  .an-chart-container {
    position: relative;
    width: 100%;
    height: 195px;
    padding-top: var(--space-3);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .an-chart-avg-line {
    position: absolute;
    left: 0;
    right: 0;
    border-bottom: 1px dashed var(--border-strong);
    pointer-events: none;
    z-index: 1;
  }
  .an-chart-columns {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 100%;
    position: relative;
    z-index: 2;
  }
  .an-col-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    gap: 6px;
    cursor: pointer;
  }
  .an-col-track {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .an-col-fill {
    width: 70%;
    max-width: 26px;
    background: #005930;
    border-radius: 4px 4px 1px 1px;
    position: relative;
    transition: opacity var(--duration-fast), background var(--duration-fast);
  }
  .an-col-fill:hover {
    background: #059669;
  }
  .an-col-wrap--weekend .an-col-fill {
    background: var(--border-strong);
    opacity: 0.45;
  }
  .an-col-wrap--today .an-col-fill {
    background: #059669;
    box-shadow: 0 0 8px #05966940;
  }
  .an-col-label {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    white-space: nowrap;
  }
  .an-col-wrap--today .an-col-label {
    font-weight: 700;
    color: #059669;
  }
  .an-col-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-6px);
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-fast);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    z-index: 10;
  }
  .an-col-tooltip strong { font-size: 0.75rem; }
  .an-col-tooltip small  { color: var(--text-tertiary); margin-top: 1px; }
  .an-col-fill:hover .an-col-tooltip {
    opacity: 1;
  }
  .an-chart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border-default);
  }
  .an-chart-note {
    font-size: 0.72rem;
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ── Location Compliance Donut ── */
  .an-loc-content {
    display: flex;
    align-items: center;
    gap: 32px;
  }
  .an-loc-donut-area {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-donut-container {
    position: relative;
    width: 114px;
    height: 114px;
  }
  .an-donut-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .an-donut-pct {
    font-size: 1.45rem;
    font-weight: 700;
    line-height: 1;
  }
  .an-donut-sub {
    font-size: 0.68rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 3px;
  }
  .an-loc-breakdown {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .an-loc-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .an-loc-item__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }
  .an-loc-item__header strong { color: var(--text-primary); }
  .an-loc-item__title {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .an-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .an-loc-progress {
    height: 6px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-loc-progress-bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }

  /* ── Milestone Progress Brackets ── */
  .an-bracket-stack, .an-dist-stack {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .an-bracket-row, .an-dist-row {
    display: grid;
    grid-template-columns: 110px 1fr 85px;
    align-items: center;
    gap: var(--space-3);
  }
  .an-bracket-label, .an-dist-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-bracket-track, .an-dist-track {
    height: 6px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-bracket-fill, .an-dist-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }
  .an-bracket-badge, .an-dist-badge {
    font-size: 0.74rem;
    font-weight: 600;
    text-align: right;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
  }

  /* ── Trainee Progress Ledger (Tab 2) ── */
  .an-table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-default);
    flex-wrap: wrap;
  }
  .an-table-toolbar__left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    flex: 1;
  }
  .an-search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 6px 12px;
    min-width: 260px;
    max-width: 380px;
    flex: 1;
  }
  .an-search-box input {
    border: none;
    background: transparent;
    font-size: 0.8rem;
    color: var(--text-primary);
    width: 100%;
    outline: none;
  }
  .an-filter-select {
    padding: 6px 10px;
    font-size: 0.8rem;
    border: 1px solid var(--border-default);
    background: var(--bg-elevated);
    color: var(--text-primary);
    border-radius: var(--radius-md);
    cursor: pointer;
    outline: none;
  }
  .an-table-count {
    font-size: 0.76rem;
    color: var(--text-secondary);
  }

  .an-table-wrap {
    overflow-x: auto;
  }
  .an-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }
  .an-table thead tr {
    background: var(--bg-secondary);
  }
  .an-table th {
    padding: 11px 18px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-tertiary);
    border-bottom: 1px solid var(--border-default);
    text-align: left;
    white-space: nowrap;
  }
  .an-table td {
    padding: 12px 18px;
    vertical-align: middle;
    border-bottom: 1px solid var(--border-default);
    color: var(--text-primary);
  }
  .an-table tbody tr:hover {
    background: var(--bg-secondary);
  }

  .an-user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .an-user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #005930;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.74rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .an-user-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .an-user-name {
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-user-id {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    white-space: nowrap;
  }
  .an-course-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    font-weight: 600;
    background: #00593012;
    color: #005930;
    border: 1px solid #00593025;
  }
  .an-hte-cell {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .an-hte-company {
    font-size: 0.8rem;
    color: var(--text-primary);
  }
  .an-hte-supervisor {
    font-size: 0.7rem;
    color: var(--text-tertiary);
  }
  .an-table-progress-wrap {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .an-table-progress-track {
    height: 6px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-table-progress-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }
  .an-table-progress-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.7rem;
    color: var(--text-tertiary);
  }
  .an-accredited-tag {
    font-size: 0.66rem;
    color: #0284C7;
    font-weight: 600;
  }
  .an-pct-pill {
    display: inline-block;
    font-size: 0.76rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
  }
  .an-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    font-weight: 600;
  }
  .an-chip--good   { background: #05966914; color: #059669; border: 1px solid #05966930; }
  .an-chip--info   { background: #0284C714; color: #0284C7; border: 1px solid #0284C730; }
  .an-chip--warn   { background: #D9770614; color: #D97706; border: 1px solid #D9770630; }
  .an-chip--urgent { background: #EF444414; color: #EF4444; border: 1px solid #EF444430; }
  .an-btn-inspect {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border: 1px solid var(--border-default);
    background: var(--bg-elevated);
    border-radius: var(--radius-md);
    font-size: 0.74rem;
    font-weight: 600;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-btn-inspect:hover {
    background: var(--bg-secondary);
    border-color: var(--border-strong);
    color: #005930;
  }

  /* ── Attendance Audit Table (Tab 3) ── */
  .an-table-filter-group {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-secondary);
    padding: 2px;
    border-radius: var(--radius-md);
  }
  .an-table-filter {
    border: none;
    background: transparent;
    font-size: 0.74rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding: 3px 9px;
    border-radius: calc(var(--radius-md) - 2px);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-table-filter--active {
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  }
  .an-time-tag {
    display: inline-block;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
    font-weight: 600;
    font-size: 0.74rem;
    color: var(--text-primary);
  }
  .an-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .an-status-chip--good {
    background: #05966914;
    color: #059669;
    border: 1px solid #05966930;
  }
  .an-status-chip--warn {
    background: #EF444414;
    color: #EF4444;
    border: 1px solid #EF444430;
  }
  .an-status-chip--neutral {
    background: var(--bg-secondary);
    color: var(--text-tertiary);
    border: 1px solid var(--border-default);
  }
  .an-task-desc {
    font-size: 0.74rem;
    color: var(--text-secondary);
    display: block;
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Official Document Preview (Tab 4) ── */
  .an-print-preview-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-default);
    flex-wrap: wrap;
  }
  .an-print-preview-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .an-print-preview-sub {
    font-size: 0.76rem;
    color: var(--text-tertiary);
    margin: 2px 0 0;
  }
  .an-official-sheet {
    background: #ffffff;
    color: #111827;
    border: 1px solid #D1D5DB;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    border-radius: 4px;
    padding: 40px 48px;
    margin: 10px auto;
    max-width: 900px;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .an-sheet-header {
    text-align: center;
    margin-bottom: 24px;
  }
  .an-sheet-republic {
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #4B5563;
    font-weight: 600;
  }
  .an-sheet-univ {
    font-size: 14pt;
    font-weight: 800;
    color: #005930;
    letter-spacing: 0.04em;
    margin-top: 3px;
  }
  .an-sheet-office {
    font-size: 9.5pt;
    font-weight: 700;
    color: #1F2937;
    margin-top: 2px;
    letter-spacing: 0.02em;
  }
  .an-sheet-address {
    font-size: 8pt;
    color: #6B7280;
    margin-top: 2px;
  }
  .an-sheet-divider {
    height: 2px;
    background: #005930;
    margin: 14px auto 16px;
    width: 100%;
  }
  .an-sheet-doc-title {
    font-size: 12pt;
    font-weight: 800;
    letter-spacing: 0.03em;
    color: #111827;
    text-transform: uppercase;
  }
  .an-sheet-term {
    font-size: 9pt;
    color: #4B5563;
    font-weight: 600;
    margin-top: 2px;
  }
  .an-sheet-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    padding: 10px 14px;
    font-size: 8.5pt;
    margin-bottom: 20px;
    color: #374151;
  }
  .an-sheet-meta-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .an-sheet-sec-title {
    font-size: 9pt;
    font-weight: 800;
    color: #005930;
    letter-spacing: 0.04em;
    margin: 18px 0 8px;
    padding-bottom: 3px;
    border-bottom: 1px solid #00593030;
    text-transform: uppercase;
  }
  .an-sheet-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8pt;
    margin-bottom: 12px;
  }
  .an-sheet-table th {
    background: #F3F4F6;
    color: #111827;
    padding: 6px 10px;
    border: 1px solid #D1D5DB;
    text-align: left;
    font-weight: 700;
    font-size: 7.5pt;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .an-sheet-table td {
    padding: 6px 10px;
    border: 1px solid #E5E7EB;
    color: #1F2937;
    vertical-align: middle;
  }
  .an-sheet-table tr:nth-child(even) td {
    background: #FAFAFA;
  }
  .an-sheet-table--roster td {
    padding: 5px 8px;
    font-size: 7.5pt;
  }
  .an-sheet-cert-box {
    margin-top: 24px;
    padding-top: 14px;
    border-top: 1px solid #D1D5DB;
    font-size: 8pt;
    color: #374151;
    line-height: 1.5;
  }
  .an-sheet-sigs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 36px;
  }
  .an-sheet-sig-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .an-sheet-sig-line {
    width: 220px;
    border-top: 1.5px solid #111827;
    margin-bottom: 6px;
  }
  .an-sheet-sig-name {
    font-weight: 800;
    font-size: 8.5pt;
    color: #111827;
  }
  .an-sheet-sig-title {
    font-size: 7.5pt;
    color: #4B5563;
  }
  .an-sheet-sig-date {
    font-size: 7.5pt;
    color: #6B7280;
    margin-top: 4px;
  }

  /* ── Modal (Trainee Details) ── */
  .an-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
  }
  .an-modal {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .an-modal__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-default);
  }
  .an-modal__head-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .an-modal__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #005930;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 700;
  }
  .an-modal__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
  .an-modal__sub {
    font-size: 0.74rem;
    color: var(--text-tertiary);
    margin: 2px 0 0;
  }
  .an-modal__close {
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
  }
  .an-modal__close:hover {
    color: var(--text-primary);
    background: var(--bg-secondary);
  }
  .an-modal__body {
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .an-modal-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 12px 14px;
    font-size: 0.78rem;
  }
  .an-modal-lbl {
    display: block;
    font-size: 0.7rem;
    color: var(--text-tertiary);
    margin-bottom: 2px;
  }
  .an-modal-kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .an-modal-kpi {
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .an-modal-kpi__lbl {
    font-size: 0.68rem;
    color: var(--text-tertiary);
  }
  .an-modal-kpi__val {
    font-size: 1.05rem;
    font-weight: 700;
  }
  .an-modal-progress {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .an-modal-progress__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.76rem;
    color: var(--text-secondary);
  }
  .an-modal-progress__track {
    height: 7px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-modal-progress__fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }
  .an-modal-logs-title {
    font-size: 0.84rem;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }
  .an-modal-logs-table-wrap {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
  }
  .an-modal-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.74rem;
  }
  .an-modal-table th {
    background: var(--bg-secondary);
    padding: 6px 10px;
    text-align: left;
    font-size: 0.68rem;
    color: var(--text-tertiary);
    font-weight: 700;
    border-bottom: 1px solid var(--border-default);
  }
  .an-modal-table td {
    padding: 6px 10px;
    border-bottom: 1px solid var(--border-default);
  }
  .an-modal__foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 20px;
    border-top: 1px solid var(--border-default);
    background: var(--bg-secondary);
  }

  /* ── Responsive Adaptations ── */
  @media (max-width: 1200px) {
    .an-hero-grid { grid-template-columns: repeat(2, 1fr); }
    .an-briefing-grid { grid-template-columns: 1fr; }
    .an-layout-row { grid-template-columns: 1fr; }
    .an-layout-row--velocity { grid-template-columns: 1fr; }
    .an-layout-row--3col { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .an-hero-grid { grid-template-columns: 1fr; }
    .an-header { flex-direction: column; align-items: flex-start; }
    .an-header__actions { width: 100%; justify-content: flex-start; }
    .an-loc-content { flex-direction: column; align-items: flex-start; }
    .an-velocity-legend { display: none; }
    .an-modal-kpis { grid-template-columns: 1fr 1fr; }
    .an-official-sheet { padding: 20px; }
    .an-sheet-sigs { grid-template-columns: 1fr; gap: 20px; }
  }

  /* ── Official High-Precision Print Stylesheet ── */
  @media print {
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 12mm 10mm;
    }
    /* Hide all web chrome, navigation, headers, and tabs */
    .sidebar-left, .navbar, .mobile-bottom-nav,
    .an-header, .an-nav-bar, .an-hero-grid, .an-briefing-card,
    #pane-overview, #pane-trainees, #pane-attendance,
    .an-print-preview-toolbar, .an-modal-backdrop {
      display: none !important;
    }
    body, .an-page, #an-root, #pane-print-preview {
      background: #ffffff !important;
      color: #000000 !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      box-shadow: none !important;
      display: block !important;
    }
    .an-card {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .an-official-sheet {
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
      max-width: 100% !important;
      width: 100% !important;
    }
    .an-sheet-table {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .an-sheet-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .an-sheet-cert-box {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
  `;
  document.head.appendChild(s);
}
