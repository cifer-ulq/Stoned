/* ── Reusable Data Table & Mobile Card Component — Admin Portal ── */
import { icon } from './icons.js';

export function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSkeletonMarkup(columns, skeletonRows = 5) {
  const rowCols = columns.map(col => `
    <td class="${col.className || ''}">
      <div class="skeleton jp-skel-bar" style="width:${col.skeletonWidth || '75%'};"></div>
    </td>
  `).join('');

  const tableRows = Array.from({ length: skeletonRows }, () => `
    <tr class="jp-skeleton-row" aria-hidden="true">${rowCols}</tr>
  `).join('');

  const mobileCards = Array.from({ length: skeletonRows }, () => `
    <div class="jp-mobile-card jp-mobile-card--skeleton" aria-hidden="true">
      <div class="skeleton" style="height:18px;width:68%;margin-bottom:8px;"></div>
      <div class="skeleton" style="height:13px;width:45%;margin-bottom:14px;"></div>
      <div class="skeleton" style="height:52px;width:100%;border-radius:var(--radius-lg);margin-bottom:12px;"></div>
      <div class="skeleton" style="height:34px;width:100%;border-radius:var(--radius-md);"></div>
    </div>
  `).join('');

  return { tableRows, mobileCards };
}

/**
 * Render a theme-consistent responsive data table with loading skeletons,
 * empty states, desktop horizontal scroll, and <768px stacked mobile cards.
 */
export function renderDataTable(container, {
  columns = [],
  rows = [],
  rowKey = (row) => row?.id,
  loading = false,
  skeletonRows = 5,
  emptyState = null,
  errorState = null,
  mobileCardRenderer = null,
  onRowClick = null,
  ariaLabel = 'Data table',
  footerEl = null,
} = {}) {
  if (!container) return;

  if (errorState) {
    container.innerHTML = `
      <div class="cp-table-card jp-table-card">
        <div class="cp-empty jp-empty">
          <div class="cp-empty__icon jp-empty__icon--error">${icon(errorState.iconName || 'alert-circle', 26)}</div>
          <h3 class="cp-empty__title">${escapeHtml(errorState.title || 'Failed to load')}</h3>
          <p class="cp-empty__text">${escapeHtml(errorState.text || 'Could not connect to the server.')}</p>
          ${errorState.actionLabel ? `<button type="button" class="btn btn--outline btn--sm" id="jp-table-empty-action">${icon('refresh-cw', 13)} ${escapeHtml(errorState.actionLabel)}</button>` : ''}
        </div>
      </div>
    `;
    if (errorState.actionLabel && typeof errorState.onAction === 'function') {
      container.querySelector('#jp-table-empty-action')?.addEventListener('click', errorState.onAction);
    }
    return;
  }

  if (loading) {
    const { tableRows, mobileCards } = renderSkeletonMarkup(columns, skeletonRows);
    container.innerHTML = `
      <div class="cp-table-card jp-table-card" aria-busy="true">
        <div class="cp-table-responsive jp-table-responsive">
          <table class="cp-table jp-table" aria-label="${escapeHtml(ariaLabel)}">
            <thead>
              <tr>
                ${columns.map(col => `<th class="${col.headerClassName || ''}">${escapeHtml(col.label)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        ${mobileCardRenderer ? `<div class="jp-mobile-cards">${mobileCards}</div>` : ''}
      </div>
    `;
    return;
  }

  if (!rows.length) {
    const es = emptyState || {};
    container.innerHTML = `
      <div class="cp-table-card jp-table-card">
        <div class="cp-empty jp-empty">
          <div class="cp-empty__icon">${icon(es.iconName || 'briefcase', 26)}</div>
          <h3 class="cp-empty__title">${escapeHtml(es.title || 'No records found')}</h3>
          <p class="cp-empty__text">${escapeHtml(es.text || 'There are no items to display.')}</p>
          ${es.actionLabel ? `<button type="button" class="btn btn--outline btn--sm" id="jp-table-empty-action">${icon('refresh-cw', 13)} ${escapeHtml(es.actionLabel)}</button>` : ''}
        </div>
      </div>
    `;
    if (es.actionLabel && typeof es.onAction === 'function') {
      container.querySelector('#jp-table-empty-action')?.addEventListener('click', es.onAction);
    }
    return;
  }

  const headerHtml = columns.map(col => {
    const alignCls = col.align === 'right' ? 'jp-col-right' : col.align === 'center' ? 'jp-col-center' : '';
    return `<th class="${[alignCls, col.headerClassName].filter(Boolean).join(' ')}">${escapeHtml(col.label)}</th>`;
  }).join('');

  const bodyHtml = rows.map(row => {
    const id = escapeHtml(rowKey(row));
    const tds = columns.map(col => {
      const alignCls = col.align === 'right' ? 'jp-col-right' : col.align === 'center' ? 'jp-col-center' : '';
      const cls = [alignCls, col.className].filter(Boolean).join(' ');
      const cellContent = typeof col.render === 'function' ? col.render(row) : escapeHtml(row?.[col.key] ?? '');
      return `<td${cls ? ` class="${cls}"` : ''}>${cellContent}</td>`;
    }).join('');
    return `<tr class="jp-table-row${onRowClick ? ' jp-table-row--clickable' : ''}" data-row-id="${id}">${tds}</tr>`;
  }).join('');

  const mobileHtml = mobileCardRenderer
    ? `<div class="jp-mobile-cards">${rows.map(row => mobileCardRenderer(row)).join('')}</div>`
    : '';

  container.innerHTML = `
    <div class="cp-table-card jp-table-card">
      <div class="cp-table-responsive jp-table-responsive">
        <table class="cp-table jp-table" aria-label="${escapeHtml(ariaLabel)}">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
      ${mobileHtml}
      <div class="jp-table-footer" data-table-footer></div>
    </div>
  `;

  if (footerEl && container.querySelector('[data-table-footer]')) {
    container.querySelector('[data-table-footer]').appendChild(footerEl);
  }

  if (typeof onRowClick === 'function') {
    const rowMap = new Map(rows.map(r => [String(rowKey(r)), r]));
    container.querySelectorAll('tr.jp-table-row[data-row-id], .jp-mobile-card[data-row-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input, select, [data-no-row-click]')) return;
        const row = rowMap.get(String(el.dataset.rowId));
        if (row) onRowClick(row, e);
      });
    });
  }
}
