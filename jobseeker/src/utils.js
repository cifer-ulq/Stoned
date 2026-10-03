/**
 * CHMSU HireMe Jobseeker — Shared Utilities
 */

export function showToast(message, type = 'success', duration = 4000) {
  const pathMap = {
    success: 'M9 12l2 2 4-4',
    warning: 'M12 9v4m0 4h.01',
    error:   'M6 18L18 6M6 6l12 12',
    info:    'M13 16h-1v-4h-1m1-4h.01',
  };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `
    <svg class="toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="${pathMap[type] || pathMap.info}"/>
    </svg>
    <span class="toast__message">${message}</span>`;
  const container = document.querySelector('.toast-container') || document.body;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
