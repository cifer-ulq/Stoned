/* ── Reusable Pagination Component — Admin Portal ── */
import { icon } from './icons.js';

/**
 * Compute page slice and normalized bounds for client-side lists.
 * Always clamps currentPage into [1, totalPages].
 */
export function paginateItems(items, requestedPage = 1, pageSize = 5) {
  const list = Array.isArray(items) ? items : [];
  const size = Math.max(1, Number(pageSize) || 5);
  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const currentPage = Math.max(1, Math.min(Number(requestedPage) || 1, totalPages));
  const startOffset = (currentPage - 1) * size;
  const pageItems = list.slice(startOffset, startOffset + size);

  return {
    items: pageItems,
    currentPage,
    totalPages,
    totalItems,
    startIndex: totalItems === 0 ? 0 : startOffset + 1,
    endIndex: totalItems === 0 ? 0 : startOffset + pageItems.length,
  };
}

/**
 * Build compact page number list with '…' ellipsis when totalPages > 7.
 * Never places an ellipsis for a single-page gap (e.g. avoids "1 … 3").
 */
export function buildPageTokens(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let winStart = Math.max(2, currentPage - 1);
  let winEnd = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    winEnd = Math.max(winEnd, 4);
  } else if (currentPage >= totalPages - 2) {
    winStart = Math.min(winStart, totalPages - 3);
  }

  const tokens = [1];

  if (winStart === 3) {
    tokens.push(2);
  } else if (winStart > 3) {
    tokens.push('…');
  }

  for (let p = winStart; p <= winEnd; p++) {
    tokens.push(p);
  }

  if (winEnd === totalPages - 2) {
    tokens.push(totalPages - 1);
  } else if (winEnd < totalPages - 2) {
    tokens.push('…');
  }

  tokens.push(totalPages);
  return tokens;
}

/**
 * Render an accessible pagination footer using existing `.an-pagination` classes.
 */
export function renderPagination(container, {
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  itemLabel = 'items',
  onPageChange,
} = {}) {
  if (!container) return;

  if (totalItems <= 0) {
    container.innerHTML = '';
    return;
  }

  const tokens = buildPageTokens(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  container.innerHTML = `
    <div class="an-pagination jp-pagination" role="navigation" aria-label="Pagination">
      <div class="an-pg-info jp-pg-summary">
        Showing <strong>${startIndex.toLocaleString()}</strong> to <strong>${endIndex.toLocaleString()}</strong> of <strong>${totalItems.toLocaleString()}</strong> ${itemLabel}
      </div>
      <div class="jp-pg-controls">
        <button
          type="button"
          class="an-pg-btn an-pg-btn--nav jp-pg-nav"
          data-page="${currentPage - 1}"
          aria-label="Previous page"
          ${isFirst ? 'disabled aria-disabled="true"' : ''}
        >
          ${icon('chevron-left', 14)}
          <span class="jp-pg-nav__label">Previous</span>
        </button>

        <div class="jp-pg-pages">
          ${tokens.map(token => {
            if (token === '…') {
              return '<span class="jp-pg-ellipsis" aria-hidden="true">…</span>';
            }
            const isActive = token === currentPage;
            return `
              <button
                type="button"
                class="an-pg-btn${isActive ? ' an-pg-btn--active' : ''}"
                data-page="${token}"
                aria-label="Page ${token}"
                ${isActive ? 'aria-current="page"' : ''}
              >${token}</button>
            `;
          }).join('')}
        </div>

        <button
          type="button"
          class="an-pg-btn an-pg-btn--nav jp-pg-nav"
          data-page="${currentPage + 1}"
          aria-label="Next page"
          ${isLast ? 'disabled aria-disabled="true"' : ''}
        >
          <span class="jp-pg-nav__label">Next</span>
          ${icon('chevron-right', 14)}
        </button>
      </div>
    </div>
  `;

  container.querySelectorAll('.an-pg-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const target = Number(btn.dataset.page);
      if (Number.isFinite(target) && target !== currentPage && typeof onPageChange === 'function') {
        onPageChange(target);
      }
    });
  });
}
