/* ── Job Postings Analytics Charts (Apache ECharts, Theme-Token Derived) ── */
import * as echarts from 'echarts/core';
import { BarChart, PieChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import { escapeHtml } from './data-table.js';
import { icon } from './icons.js';

echarts.use([BarChart, PieChart, ScatterChart, GridComponent, TooltipComponent, SVGRenderer]);

const TYPE_COLOR_EXPRS = {
  'Full-time':  'var(--color-primary-light)',
  'Remote':     'var(--color-success)',
  'Part-time':  'var(--color-warning)',
  'Contract':   'var(--color-gray-400)',
  'Freelance':  'color-mix(in srgb, var(--color-error) 55%, var(--color-warning))',
  'Internship': 'color-mix(in srgb, var(--color-success) 55%, var(--color-gray-400))',
};

const TYPE_FALLBACK_EXPRS = [
  'var(--color-error)',
  'var(--color-primary)',
  'color-mix(in srgb, var(--color-primary-light) 50%, var(--color-warning))',
  'var(--color-gray-500)',
];

const SKILL_RAMP_EXPRS = [
  'color-mix(in srgb, var(--color-success) 78%, var(--color-primary-light))',
  'color-mix(in srgb, var(--color-success) 48%, var(--color-primary-light))',
  'var(--color-primary-light)',
  'color-mix(in srgb, var(--color-primary-light) 85%, var(--color-gray-400))',
  'color-mix(in srgb, var(--color-primary-light) 70%, var(--color-gray-400))',
  'color-mix(in srgb, var(--color-primary-light) 56%, var(--color-gray-400))',
  'color-mix(in srgb, var(--color-primary-light) 42%, var(--color-gray-400))',
  'color-mix(in srgb, var(--color-primary-light) 30%, var(--color-gray-400))',
];

export function normalizeSkills(skillsVal) {
  if (Array.isArray(skillsVal)) {
    return skillsVal.map(s => String(s ?? '').trim()).filter(Boolean);
  }
  if (typeof skillsVal === 'string') {
    const trimmed = skillsVal.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(s => String(s ?? '').trim()).filter(Boolean);
      }
    } catch {
      // Fallback for comma-separated skill strings
    }
    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function getEmploymentTypeExpr(typeName, idx = 0) {
  if (TYPE_COLOR_EXPRS[typeName]) return TYPE_COLOR_EXPRS[typeName];
  const lower = String(typeName || '').toLowerCase();
  const matchedKey = Object.keys(TYPE_COLOR_EXPRS).find(k => k.toLowerCase() === lower);
  if (matchedKey) return TYPE_COLOR_EXPRS[matchedKey];
  return TYPE_FALLBACK_EXPRS[idx % TYPE_FALLBACK_EXPRS.length];
}

/**
 * Evaluate existing CSS variables & CSS color-mix() expressions dynamically against active theme.
 * Contains zero hardcoded hex/rgb values.
 */
function resolveThemeTokens() {
  const probe = document.createElement('span');
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(probe);

  const readColor = (expr) => {
    probe.style.color = '';
    probe.style.color = expr;
    return getComputedStyle(probe).color;
  };

  try {
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      fontFamily: rootStyle.getPropertyValue('--font-body').trim() || 'sans-serif',
      textPrimary: readColor('var(--text-primary)'),
      textSecondary: readColor('var(--text-secondary)'),
      bgElevated: readColor('var(--bg-elevated)'),
      bgSecondary: readColor('var(--bg-secondary)'),
      borderDefault: readColor('var(--border-default)'),
      borderStrong: readColor('var(--border-strong)'),
      primary: readColor('var(--color-primary)'),
      primaryLight: readColor('var(--color-primary-light)'),
      success: readColor('var(--color-success)'),
      warning: readColor('var(--color-warning)'),
      error: readColor('var(--color-error)'),
      gray400: readColor('var(--color-gray-400)'),
      trackBg: readColor('color-mix(in srgb, var(--bg-secondary) 55%, transparent)'),
      hoverBg: readColor('var(--color-primary-bg)'),
      stemColor: readColor('color-mix(in srgb, var(--color-primary-light) 55%, var(--color-gray-400))'),
      skillRamp: SKILL_RAMP_EXPRS.map(expr => readColor(expr)),
      resolveExpr: readColor,
    };
  } finally {
    probe.remove();
  }
}

function getTooltipStyle(t) {
  return {
    renderMode: 'html',
    confine: true,
    backgroundColor: t.bgElevated,
    borderColor: t.borderStrong,
    borderWidth: 1,
    padding: [10, 12],
    textStyle: {
      color: t.textPrimary,
      fontSize: 12,
      fontFamily: t.fontFamily,
    },
    extraCssText: 'border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); max-width: 260px; white-space: normal;',
  };
}

function formatSharePct(part, total) {
  if (!total || part <= 0) return '0%';
  const raw = (part / total) * 100;
  const rounded = Math.round(raw);
  return rounded === 0 ? '<1%' : `${rounded}%`;
}

function mountEChart(hostEl, buildOption) {
  if (!hostEl) return null;

  if (typeof hostEl.__jpCleanup === 'function') {
    hostEl.__jpCleanup();
  }

  const existing = echarts.getInstanceByDom(hostEl);
  if (existing) existing.dispose();

  const chart = echarts.init(hostEl, null, { renderer: 'svg' });
  const apply = () => {
    if (!hostEl.isConnected) return;
    const tokens = resolveThemeTokens();
    chart.setOption(buildOption(tokens), true);
  };

  apply();

  const resizeObserver = new ResizeObserver(() => {
    if (!hostEl.isConnected) return;
    if (hostEl.clientWidth > 0 && hostEl.clientHeight > 0) {
      chart.resize();
    }
  });
  resizeObserver.observe(hostEl);

  const themeObserver = new MutationObserver((mutations) => {
    if (!hostEl.isConnected) return;
    if (mutations.some(m => m.attributeName === 'data-theme')) {
      requestAnimationFrame(apply);
    }
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  hostEl.__jpCleanup = () => {
    resizeObserver.disconnect();
    themeObserver.disconnect();
    if (!chart.isDisposed()) {
      chart.dispose();
    }
    delete hostEl.__jpCleanup;
  };

  return chart;
}

export function disposeJobCharts(rootEl) {
  if (!rootEl) return;
  rootEl.querySelectorAll('.jp-echart-host').forEach(node => {
    if (typeof node.__jpCleanup === 'function') {
      node.__jpCleanup();
    } else {
      const inst = echarts.getInstanceByDom(node);
      if (inst && !inst.isDisposed()) inst.dispose();
    }
  });
}

/* ── 1. Top In-Demand Skills — Horizontal Bar Chart ── */
export function renderSkillsBarChart(container, jobs) {
  if (!container) return;

  const skillMap = {};
  jobs.forEach(j => {
    normalizeSkills(j.skills).forEach(sk => {
      skillMap[sk] = (skillMap[sk] || 0) + 1;
    });
  });

  const topSkills = Object.entries(skillMap)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8);

  if (!topSkills.length) {
    container.innerHTML = `
      <div class="jp-chart-empty">
        <div class="jp-chart-empty__icon">${icon('star', 20)}</div>
        <p class="jp-chart-empty__text">No skills specified across current postings</p>
      </div>
    `;
    return;
  }

  const totalJobs = jobs.length;
  const chartHeight = Math.max(168, topSkills.length * 30 + 36);
  container.innerHTML = `
    <div
      class="jp-echart-host jp-echart-host--skills"
      style="height:${chartHeight}px;"
      role="img"
      aria-label="Horizontal bar chart of top ${topSkills.length} in-demand skills"
    ></div>
  `;

  const hostEl = container.querySelector('.jp-echart-host');
  mountEChart(hostEl, (t) => ({
    animationDuration: 500,
    animationEasing: 'cubicOut',
    tooltip: {
      ...getTooltipStyle(t),
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: t.hoverBg },
      },
      formatter: (params) => {
        const pt = Array.isArray(params) ? params[0] : params;
        if (!pt) return '';
        const idx = pt.dataIndex ?? 0;
        const [skillName, count] = topSkills[idx] || [pt.name, pt.value];
        const share = totalJobs > 0 ? ((count / totalJobs) * 100).toFixed(1) : '0.0';
        return `
          <div class="jp-tooltip">
            <div class="jp-tooltip__eyebrow">Rank #${idx + 1}</div>
            <div class="jp-tooltip__title">${escapeHtml(skillName)}</div>
            <div class="jp-tooltip__row">
              <span>Job Postings</span>
              <strong>${Number(count).toLocaleString()}</strong>
            </div>
            <div class="jp-tooltip__row">
              <span>Share of Postings</span>
              <strong>${share}%</strong>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: 8,
      right: 40,
      top: 8,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      min: 0,
      minInterval: 1,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: t.textSecondary,
        fontSize: 11,
        fontFamily: t.fontFamily,
        formatter: v => Number(v).toLocaleString(),
      },
      splitLine: {
        lineStyle: { color: t.borderDefault, type: 'dashed' },
      },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: topSkills.map(([skill]) => skill),
      axisLine: { lineStyle: { color: t.borderStrong } },
      axisTick: { show: false },
      axisLabel: {
        color: t.textSecondary,
        fontSize: 11,
        fontFamily: t.fontFamily,
        width: 136,
        overflow: 'truncate',
        ellipsis: '…',
      },
    },
    series: [
      {
        name: 'Job Postings',
        type: 'bar',
        barWidth: 14,
        showBackground: true,
        backgroundStyle: {
          color: t.trackBg,
          borderRadius: [0, 6, 6, 0],
        },
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
        },
        emphasis: {
          focus: 'series',
        },
        label: {
          show: true,
          position: 'right',
          distance: 8,
          color: t.textPrimary,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: t.fontFamily,
          formatter: ({ value }) => Number(value).toLocaleString(),
        },
        data: topSkills.map(([skill, count], idx) => ({
          name: skill,
          value: count,
          itemStyle: {
            color: t.skillRamp[idx % t.skillRamp.length],
          },
        })),
      },
    ],
  }));
}

/* ── 2. By Employment Type — Donut Chart with Total in Center ── */
export function renderEmploymentDonutChart(container, jobs) {
  if (!container) return;

  const typeMap = {};
  jobs.forEach(j => {
    const typeLabel = (j.type || '').trim() || 'Unspecified';
    typeMap[typeLabel] = (typeMap[typeLabel] || 0) + 1;
  });

  const typeSorted = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const total = jobs.length;

  if (!total || !typeSorted.length) {
    container.innerHTML = `
      <div class="jp-chart-empty">
        <div class="jp-donut-empty-ring" aria-hidden="true">
          <span>0</span>
          <small>POSTINGS</small>
        </div>
        <p class="jp-chart-empty__text">No employment type data</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="jp-donut-layout">
      <div class="jp-donut-stage">
        <div
          class="jp-echart-host jp-echart-host--donut"
          role="img"
          aria-label="Donut chart of ${total.toLocaleString()} job postings by employment type"
        ></div>
        <div class="jp-donut-center" aria-hidden="true">
          <span class="jp-donut-center__value">${total.toLocaleString()}</span>
          <span class="jp-donut-center__label">POSTING${total !== 1 ? 'S' : ''}</span>
        </div>
      </div>

      <ul class="jp-donut-legend" aria-label="Employment type breakdown">
        ${typeSorted.map(([typeName, count], idx) => {
          const cssColorExpr = getEmploymentTypeExpr(typeName, idx);
          const pctLabel = formatSharePct(count, total);
          return `
            <li>
              <button
                type="button"
                class="jp-donut-legend__item"
                data-donut-idx="${idx}"
                title="${escapeHtml(typeName)}: ${count.toLocaleString()} (${pctLabel})"
              >
                <span class="jp-donut-legend__left">
                  <span class="jp-donut-legend__dot" style="background:${cssColorExpr};"></span>
                  <span class="jp-donut-legend__name">${escapeHtml(typeName)}</span>
                </span>
                <span class="jp-donut-legend__right">
                  <span class="jp-donut-legend__count">${count.toLocaleString()}</span>
                  <span class="jp-donut-legend__pct">${pctLabel}</span>
                </span>
              </button>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;

  const hostEl = container.querySelector('.jp-echart-host');
  const chart = mountEChart(hostEl, (t) => ({
    animationDuration: 550,
    animationEasing: 'cubicOut',
    tooltip: {
      ...getTooltipStyle(t),
      trigger: 'item',
      formatter: (p) => {
        const exactPct = total > 0 ? ((p.value / total) * 100).toFixed(1) : '0.0';
        return `
          <div class="jp-tooltip">
            <div class="jp-tooltip__head">
              <span class="jp-tooltip__dot" style="background:${p.color};"></span>
              <span class="jp-tooltip__title">${escapeHtml(p.name)}</span>
            </div>
            <div class="jp-tooltip__row">
              <span>Postings</span>
              <strong>${Number(p.value).toLocaleString()}</strong>
            </div>
            <div class="jp-tooltip__row">
              <span>Share</span>
              <strong>${exactPct}%</strong>
            </div>
          </div>
        `;
      },
    },
    series: [
      {
        name: 'Employment Type',
        type: 'pie',
        radius: ['58%', '86%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        minAngle: 7,
        padAngle: typeSorted.length > 1 ? 2 : 0,
        itemStyle: {
          borderRadius: 4,
          borderColor: t.bgElevated,
          borderWidth: typeSorted.length > 1 ? 2 : 0,
        },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 5,
        },
        data: typeSorted.map(([typeName, count], idx) => ({
          name: typeName,
          value: count,
          itemStyle: {
            color: t.resolveExpr(getEmploymentTypeExpr(typeName, idx)),
          },
        })),
      },
    ],
  }));

  if (chart) {
    container.querySelectorAll('.jp-donut-legend__item').forEach(btn => {
      const idx = Number(btn.dataset.donutIdx);
      const activate = () => {
        btn.classList.add('is-active');
        chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: idx });
        chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: idx });
      };
      const deactivate = () => {
        btn.classList.remove('is-active');
        chart.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: idx });
        chart.dispatchAction({ type: 'hideTip' });
      };
      btn.addEventListener('mouseenter', activate);
      btn.addEventListener('mouseleave', deactivate);
      btn.addEventListener('focus', activate);
      btn.addEventListener('blur', deactivate);
    });
  }
}

/* ── 3. Top Companies by Applicants — Lollipop Chart ── */
export function renderCompaniesLollipopChart(container, jobs, badgeContainer = null) {
  if (!container) return;

  const compStats = {};
  jobs.forEach(j => {
    const companyName = (j.company || '').trim() || 'Unknown Company';
    if (!compStats[companyName]) {
      compStats[companyName] = { company: companyName, applicants: 0, postings: 0 };
    }
    compStats[companyName].applicants += Number(j.applicants) || 0;
    compStats[companyName].postings += 1;
  });

  const topCompanies = Object.values(compStats)
    .sort((a, b) => b.applicants - a.applicants || b.postings - a.postings || a.company.localeCompare(b.company))
    .slice(0, 5);

  const totalAppsAll = Object.values(compStats).reduce((s, c) => s + c.applicants, 0);

  if (badgeContainer) {
    if (jobs.length > 0 && totalAppsAll === 0) {
      badgeContainer.innerHTML = `<span class="badge badge--neutral jp-zero-apps-badge">0 total applicants</span>`;
    } else {
      badgeContainer.innerHTML = '';
    }
  }

  if (!topCompanies.length) {
    container.innerHTML = `
      <div class="jp-chart-empty">
        <div class="jp-chart-empty__icon">${icon('award', 20)}</div>
        <p class="jp-chart-empty__text">No applicant data available</p>
      </div>
    `;
    return;
  }

  const maxApps = Math.max(...topCompanies.map(c => c.applicants), 0);
  const chartHeight = Math.max(176, topCompanies.length * 40 + 36);

  container.innerHTML = `
    <div
      class="jp-echart-host jp-echart-host--lollipop"
      style="height:${chartHeight}px;"
      role="img"
      aria-label="Lollipop chart of top ${topCompanies.length} companies by applicants"
    ></div>
  `;

  const hostEl = container.querySelector('.jp-echart-host');
  mountEChart(hostEl, (t) => ({
    animationDuration: 550,
    animationEasing: 'cubicOut',
    tooltip: {
      ...getTooltipStyle(t),
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: { color: t.borderStrong, type: 'dashed' },
      },
      formatter: (params) => {
        const pt = Array.isArray(params) ? (params.find(p => p.seriesType === 'scatter') || params[0]) : params;
        if (!pt) return '';
        const idx = pt.dataIndex ?? 0;
        const entry = topCompanies[idx];
        if (!entry) return '';
        const shareLine = totalAppsAll > 0
          ? `<div class="jp-tooltip__row"><span>Applicant Share</span><strong>${((entry.applicants / totalAppsAll) * 100).toFixed(1)}%</strong></div>`
          : `<div class="jp-tooltip__note">Awaiting first applications</div>`;
        return `
          <div class="jp-tooltip">
            <div class="jp-tooltip__eyebrow">Rank #${idx + 1}</div>
            <div class="jp-tooltip__title">${escapeHtml(entry.company)}</div>
            <div class="jp-tooltip__row">
              <span>Applicants</span>
              <strong>${entry.applicants.toLocaleString()}</strong>
            </div>
            <div class="jp-tooltip__row">
              <span>Active &amp; Listed Jobs</span>
              <strong>${entry.postings.toLocaleString()}</strong>
            </div>
            ${shareLine}
          </div>
        `;
      },
    },
    grid: {
      left: 8,
      right: 40,
      top: 10,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: maxApps === 0 ? 5 : undefined,
      minInterval: 1,
      splitNumber: 4,
      axisLine: {
        show: true,
        lineStyle: { color: t.borderStrong },
      },
      axisTick: { show: false },
      axisLabel: {
        color: t.textSecondary,
        fontSize: 11,
        fontFamily: t.fontFamily,
        formatter: v => Number(v).toLocaleString(),
      },
      splitLine: {
        lineStyle: { color: t.borderDefault, type: 'dashed' },
      },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: topCompanies.map((c, idx) => `${idx + 1}. ${c.company}`),
      axisLine: { lineStyle: { color: t.borderStrong } },
      axisTick: { show: false },
      axisLabel: {
        color: t.textSecondary,
        fontSize: 11,
        fontFamily: t.fontFamily,
        width: 148,
        overflow: 'truncate',
        ellipsis: '…',
      },
    },
    series: [
      {
        name: 'Stem',
        type: 'bar',
        barWidth: 2,
        silent: true,
        tooltip: { show: false },
        z: 2,
        itemStyle: {
          color: t.stemColor,
          borderRadius: 2,
        },
        data: topCompanies.map(c => c.applicants),
      },
      {
        name: 'Applicants',
        type: 'scatter',
        symbolSize: 13,
        clip: false,
        z: 3,
        emphasis: {
          scale: 1.3,
        },
        label: {
          show: true,
          position: 'right',
          distance: 10,
          color: t.textPrimary,
          fontSize: 11,
          fontWeight: 600,
          fontFamily: t.fontFamily,
          formatter: ({ value }) => Number(value).toLocaleString(),
        },
        data: topCompanies.map((c, idx) => {
          const dotColor = c.applicants === 0
            ? t.gray400
            : (idx === 0 ? t.success : t.primaryLight);
          return {
            value: c.applicants,
            itemStyle: {
              color: dotColor,
              borderColor: t.bgElevated,
              borderWidth: 2.5,
            },
          };
        }),
      },
    ],
  }));
}
